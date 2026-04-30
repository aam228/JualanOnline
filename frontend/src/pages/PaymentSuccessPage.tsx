import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();  // ✅ Clear cart after payment
  
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [waUrl, setWaUrl] = useState('');
  const [waWarning, setWaWarning] = useState<string | null>(null);
  const waOpenedRef = useRef(false);

  // Query params: Stripe uses session_id, PayPal uses orderID
  const queryParams = new URLSearchParams(location.search);
  const providerFromUrl = (queryParams.get('provider') || '').toLowerCase();
  const sessionIdFromUrl = queryParams.get('session_id');
  const paypalOrderIdFromUrl = queryParams.get('orderID') || queryParams.get('token');
  const sessionIdFromStorage = localStorage.getItem('stripeSessionId');
  const activeProvider = providerFromUrl === 'paypal' || paypalOrderIdFromUrl ? 'paypal' : 'stripe';
  const stripeSessionId = sessionIdFromUrl || sessionIdFromStorage;

  useEffect(() => {
    const fetchStripeStatus = async () => {
      try {
        if (!stripeSessionId) {
          throw new Error('No Stripe payment session found');
        }
        const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/session/${stripeSessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment session');
        }
        const data = await response.json();
        setPaymentData(data);

        if (data.status === 'complete') {
          clearCart();
        } else {
          setError(`Payment status: ${data.status}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify Stripe payment');
      } finally {
        setLoading(false);
      }
    };

    const fetchPaypalStatus = async () => {
      try {
        if (!paypalOrderIdFromUrl) {
          throw new Error('No PayPal order ID found');
        }
        const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/paypal/order/${paypalOrderIdFromUrl}`);
        if (!response.ok) {
          throw new Error('Failed to fetch PayPal order status');
        }
        const data = await response.json();
        setPaymentData(data);

        if (data.status === 'complete') {
          clearCart();
        } else {
          setError(`Payment status: ${data.status}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify PayPal payment');
      } finally {
        setLoading(false);
      }
    };

    if (activeProvider === 'paypal') {
      fetchPaypalStatus();
      return;
    }

    fetchStripeStatus();
    if (sessionIdFromUrl) {
      localStorage.removeItem('stripeSessionId');
    }
  }, [activeProvider, stripeSessionId, sessionIdFromUrl, paypalOrderIdFromUrl, clearCart]);

  const formatPrice = (price: number) => {
    const currency = paymentData?.currency || 'IDR';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sellerWaNumber = String(import.meta.env.VITE_SELLER_WHATSAPP_NUMBER || '6287814045327').replace(/[^\d]/g, '');

  const buildWhatsAppMessage = () => {
    const order = paymentData?.order || {};
    const shippingAddress = order.shippingAddress || {};
    const items = Array.isArray(order.items) ? order.items : [];
    const paidAtRaw = order?.paidAt || order?.createdAt;
    const paidAtText = paidAtRaw ? formatDate(paidAtRaw) : '-';

    const itemLines = items.length
      ? items
          .map((item: any, idx: number) => {
            const qty = item?.quantity || 1;
            const skuText = item?.sku ? ` (SKU: ${item.sku})` : '';
            return `${idx + 1}. ${item?.name || 'Item'}${skuText} x${qty}`;
          })
          .join('\n')
      : '- Data item belum tersedia';

    return [
      'PAYMENT_VALIDATION_DATA',
      '=======================',
      '',
      'PAYMENT',
      `provider: ${(paymentData?.provider || activeProvider || '-').toUpperCase()}`,
      `transaction_id: ${paymentData?.paypalCaptureId || paymentData?.paymentIntentId || paymentData?.paymentIntent || order?.stripePaymentIntentId || order?.payment_intent_id || '-'}`,
      `payment_intent_id: ${paymentData?.paymentIntentId || paymentData?.paymentIntent || order?.stripePaymentIntentId || '-'}`,
      `paid_at: ${paidAtText || '-'}`,
      `total_amount: ${formatPrice(paymentData?.amount || 0)}`,
      `shipping_cost: ${formatPrice(order?.shippingCost || 0)}`,
      '',
      'CUSTOMER',
      `name: ${order?.customerName || '-'}`,
      `email: ${order?.customerEmail || paymentData?.customerEmail || '-'}`,
      `phone: ${shippingAddress.phone || '-'}`,
      '',
      'SHIPPING',
      `country: ${shippingAddress.country || '-'}`,
      `province/state: ${shippingAddress.state || '-'}`,
      `city: ${shippingAddress.city || '-'}`,
      `postal_code: ${shippingAddress.postalCode || '-'}`,
      `address_line_1: ${shippingAddress.address1 || '-'}`,
      `address_line_2: ${shippingAddress.address2 || '-'}`,
      '',
      'ITEMS',
      itemLines || '-',
    ].join('\n');
  };

  useEffect(() => {
    if (loading || error || !paymentData || paymentData.status !== 'complete') {
      return;
    }

    if (!sellerWaNumber) {
      setWaWarning('Nomor WhatsApp penjual belum dikonfigurasi di environment frontend (VITE_SELLER_WHATSAPP_NUMBER).');
      return;
    }

    const message = buildWhatsAppMessage();
    const targetUrl = `https://wa.me/${sellerWaNumber}?text=${encodeURIComponent(message)}`;
    setWaUrl(targetUrl);
  }, [loading, error, paymentData, sellerWaNumber]);

  useEffect(() => {
    if (!waUrl || waOpenedRef.current) {
      return;
    }

    waOpenedRef.current = true;

    const timeoutId = window.setTimeout(() => {
      const popup = window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (!popup) {
        setWaWarning('Browser menahan tab baru. Silakan klik tombol WhatsApp di bawah untuk membuka ulang.');
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [waUrl]);

  const handleOpenWhatsApp = () => {
    if (!waUrl) {
      setWaWarning('Template WhatsApp belum siap. Silakan tunggu sebentar atau cek konfigurasi nomor penjual.');
      return;
    }

    const popup = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!popup) {
      setWaWarning('Browser menahan tab baru. Silakan klik tombol WhatsApp sekali lagi atau izinkan popup.');
    }
  };

  if (loading) {
    return (
      <div className="payment-success-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memverifikasi pembayaran...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentData || paymentData.status !== 'complete') {
    return (
      <div className="payment-success-container">
        <div className="success-card failed">
          <div className="icon failed-icon">❌</div>
          <h1>Pembayaran Gagal</h1>
          <p className="status-message">
            {error || 'Terjadi kesalahan saat memproses pembayaran'}
          </p>
          <button onClick={() => navigate('/')} className="btn-home">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-header">
          <div className="success-icon">✓</div>
          <div className="success-title-wrap">
            <h1 className="success-title">Pembayaran Berhasil</h1>
            <p className="success-subtitle">Pesanan sedang diproses</p>
            <p className="success-subtitle success-subtitle-muted">WhatsApp akan dibuka otomatis di tab baru. Jika diblokir, gunakan tombol WhatsApp di bawah.</p>
            {waWarning && <p className="success-subtitle success-subtitle-muted">{waWarning}</p>}
          </div>
        </div>

        <hr className="section-divider" />

        <div className="transaction-details">
          <div className="detail-row">
            <span className="detail-label">No. Pesanan</span>
            <span className="detail-value">{paymentData.order?.orderId || stripeSessionId || paypalOrderIdFromUrl}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Tanggal</span>
            <span className="detail-value">{paymentData.order ? formatDate(paymentData.order.createdAt) : '-'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Metode Pembayaran</span>
            <span className="detail-value">{(paymentData?.provider || activeProvider || '-').toUpperCase()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className="detail-value">
              <span className="status-badge status-badge-compact">
                {paymentData.status === 'complete' ? 'Berhasil' : paymentData.status}
              </span>
            </span>
          </div>
          <div className="detail-row detail-row-total">
            <span className="detail-label">Total Pembayaran</span>
            <span className="detail-value total">{formatPrice(paymentData.amount)}</span>
          </div>
        </div>

        <div className="info-strip">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 10 10A10.012 10.012 0 0 0 12 2Zm1 15h-2v-6h2Zm0-8h-2V7h2Z" fill="currentColor" />
          </svg>
          <p>Tim kami akan menghubungi kamu via WhatsApp dalam 1×24 jam untuk konfirmasi pengiriman.</p>
        </div>

        <div className="action-buttons">
          {waUrl && (
            <button type="button" onClick={handleOpenWhatsApp} className="btn btn-whatsapp">
              Hubungi WhatsApp
            </button>
          )}
          <button onClick={() => navigate('/')} className="btn btn-home" type="button">
            Kembali ke Beranda
          </button>
        </div>

        <div className="support-info">
          <p>Ada pertanyaan? <a href="mailto:support@example.com">Hubungi kami</a></p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
