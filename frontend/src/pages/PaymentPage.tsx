import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { paymentAPI } from '../services/payment';
import './PaymentPage.css';

interface PaymentPageProps {
  amount: number;
  customerEmail: string;
  customerName: string;
  orderId?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onCancel?: () => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment Form Component
const countryOptions = [
  { code: 'ID', name: 'Indonesia', currency: 'idr' },
  { code: 'US', name: 'United States', currency: 'usd' },
  { code: 'SG', name: 'Singapore', currency: 'sgd' },
  { code: 'MY', name: 'Malaysia', currency: 'myr' },
  { code: 'JP', name: 'Japan', currency: 'jpy' },
  // Tambahkan negara & currency lain sesuai kebutuhan
];

const PaymentForm = ({
  amount,
  customerEmail,
  customerName,
  orderId,
  onSuccess,
  onCancel,
}: PaymentPageProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentElementLoaded, setPaymentElementLoaded] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0].code);
  const [selectedCurrency, setSelectedCurrency] = useState(countryOptions[0].currency);

  // Create payment intent on mount
  useEffect(() => {
    const createPayment = async () => {
      try {
        const response = await paymentAPI.createPaymentIntent(
          amount,
          selectedCurrency,
          customerEmail,
          customerName,
          orderId,
          selectedCountry
        );
        setClientSecret(response.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create payment');
      }
    };
    createPayment();
  }, [amount, customerEmail, customerName, orderId, selectedCurrency, selectedCountry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready');
      return;
    }

    setLoading(true);

    try {
      // Confirm payment with Stripe PaymentElement
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-success',
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await paymentAPI.confirmPayment(result.paymentIntent.id);
        if (onSuccess) {
          onSuccess(result.paymentIntent.id);
        }
        navigate('/payment-success', {
          state: { paymentIntentId: result.paymentIntent.id },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(selectedCountry === 'ID' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: selectedCurrency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="payment-form-container">
      <div className="payment-card">
        <h2>Pembayaran</h2>

        {/* Pilihan Negara & Mata Uang */}
        <div className="payment-summary">
          <div className="summary-row">
            <span>Negara</span>
            <select
              value={selectedCountry}
              onChange={e => {
                const code = e.target.value;
                setSelectedCountry(code);
                const found = countryOptions.find(opt => opt.code === code);
                if (found) setSelectedCurrency(found.currency);
              }}
            >
              {countryOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.name}</option>
              ))}
            </select>
          </div>
          <div className="summary-row">
            <span>Mata Uang</span>
            <select
              value={selectedCurrency}
              onChange={e => setSelectedCurrency(e.target.value)}
            >
              {countryOptions
                .filter(opt => opt.code === selectedCountry)
                .map(opt => (
                  <option key={opt.currency} value={opt.currency}>{opt.currency.toUpperCase()}</option>
                ))}
            </select>
          </div>
          <div className="summary-row">
            <span>Total Pembayaran</span>
            <span className="amount">{formatPrice(amount)}</span>
          </div>
          <div className="summary-row">
            <span>Nama</span>
            <span>{customerName}</span>
          </div>
          <div className="summary-row">
            <span>Email</span>
            <span>{customerEmail}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="payment-error">
            <div className="error-icon">⚠️</div>
            <div>{error}</div>
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="payment-element">Pilih Metode Pembayaran</label>
            <PaymentElement id="payment-element" onReady={() => setPaymentElementLoaded(true)} />
          </div>

          <div className="payment-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-pay"
              disabled={loading || !stripe || !clientSecret || !paymentElementLoaded}
            >
              {loading ? 'Memproses...' : `Bayar ${formatPrice(amount)}`}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="payment-security">
          <p>Pembayaran Anda aman dan dienkripsi dengan teknologi terbaru</p>
        </div>
      </div>
    </div>
  );
};

// Main Page Component with route integration

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as Partial<PaymentPageProps> | null;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state || !state.amount || !state.customerEmail || !state.customerName) return;
    // Create payment intent
    (async () => {
      try {
        const response = await paymentAPI.createPaymentIntent(
          Number(state.amount) || 0,
          'idr',
          state.customerEmail || '',
          state.customerName || '',
          state.orderId || '',
        );
        setClientSecret(response.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create payment');
      }
    })();
  }, [state]);

  if (!state || !state.amount || !state.customerEmail || !state.customerName) {
    return (
      <div className="payment-error-container">
        <div>Data pembayaran tidak lengkap. <a href="/">Kembali ke beranda</a></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-error-container">
        <div>{error}</div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="payment-loading-container">
        <div>Memuat pembayaran...</div>
      </div>
    );
  }

  return (
    <div>
      <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
        <PaymentForm
          amount={Number(state.amount) || 0}
          customerEmail={state.customerEmail || ''}
          customerName={state.customerName || ''}
          orderId={state.orderId || ''}
          onCancel={() => navigate('/checkout')}
        />
      </Elements>
    </div>
  );
};

export default PaymentPage;
