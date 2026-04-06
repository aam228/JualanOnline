import { useState, useEffect } from 'react';
// Floating error popup component
const ErrorPopup = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="floating-error-popup">
    <div className="popup-content">
      <span>{message}</span>
      <button className="popup-close" onClick={onClose} aria-label="Close">&times;</button>
    </div>
  </div>
);

import { useNavigate, useLocation } from 'react-router-dom';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CheckoutPage.css';


interface CheckoutForm {
  country: string;
  name: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
}

interface CheckoutDisplayItem {
  _id: string;
  name: string;
  price: number;
  quantity?: number;
  sku?: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  // Ambil product dari Buy Now jika ada
  const directProduct = location.state && location.state.product ? location.state.product : null;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  

  // Checkout form state
  const [form, setForm] = useState<CheckoutForm>({
    country: '',
    name: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [popupError, setPopupError] = useState<string | null>(null);

  // Auto-close popup after 2.5s
  useEffect(() => {
    if (popupError) {
      const timeout = setTimeout(() => setPopupError(null), 2500);
      return () => clearTimeout(timeout);
    }
  }, [popupError]);

  // Shipping regions config (USD)
  const shippingRegions = [
    { label: 'Southeast Asia', cost: 5 },
    { label: 'East Asia', cost: 8 },
    { label: 'South Asia', cost: 7.5 },
    { label: 'Middle East', cost: 10 },
    { label: 'Europe', cost: 13 },
    { label: 'North America', cost: 14 },
    { label: 'Oceania', cost: 12 },
    { label: 'Africa', cost: 15 },
    { label: 'South America', cost: 16 },
  ];
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  useEffect(() => {
    // Jika cart kosong DAN tidak ada product di location.state, redirect ke home
    if (cart.length === 0 && !directProduct) {
      navigate('/');
    }
  }, [cart, navigate, directProduct]);


  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('checkoutForm', JSON.stringify(form));
    localStorage.setItem('selectedRegion', selectedRegion);
  }, [form, selectedRegion]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('checkoutForm');
    if (saved) setForm(JSON.parse(saved));
    const savedRegion = localStorage.getItem('selectedRegion');
    if (savedRegion) setSelectedRegion(savedRegion);
  }, []);


  // Validation logic
  const validate = (field: string, value: string) => {
    switch (field) {
      case 'country':
        if (!value) return 'Country is required';
        break;
      case 'region':
        if (!value) return 'Region is required';
        break;
      case 'name':
        if (!value) return 'Full Name is required';
        break;
      case 'phone':
        if (!value) return 'Phone Number is required';
        if (value.replace(/\D/g, '').length < 8) return 'Phone Number must be at least 8 digits';
        break;
      case 'address1':
        if (!value) return 'Address Line 1 is required';
        break;
      case 'city':
        if (!value) return 'City is required';
        break;
      case 'state':
        if (!value) return 'State/Province/Region is required';
        break;
      case 'postalCode':
        if (!value) return 'Postal/ZIP Code is required';
        if (value.length < 4) return 'Postal/ZIP Code must be at least 4 characters';
        break;
      default:
        return '';
    }
    return '';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(errs => ({ ...errs, [name]: validate(name, value) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (touched[name]) {
      setErrors(errs => ({ ...errs, [name]: validate(name, value) }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields including region
    const newErrors: { [key: string]: string } = {};
    (Object.keys(form) as (keyof CheckoutForm)[]).forEach(key => {
      const err = validate(key, form[key]);
      if (err) newErrors[key] = err;
    });
    if (!selectedRegion) {
      newErrors.region = 'Region is required';
    }
    setErrors(newErrors);
    setTouched({ ...Object.fromEntries(Object.keys(form).map(k => [k, true])), region: true });
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        setStep(2); // Go to summary directly
      } finally {
        setLoading(false);
      }
    } else {
      // Show first error in popup
      const firstError = Object.values(newErrors)[0];
      setPopupError(firstError);
    }
  };

  const buildCheckoutPayload = () => {
    const productSlug = cart[0]?.slug || '';
    const productCurrency = 'USD';
    const currentUrl = window.location.href;
    const checkoutItems = itemsToShow.map((item) => ({
      id: item._id,
      name: item.name,
      sku: item.sku || null,
      quantity: item.quantity ? item.quantity : 1,
      price: item.price || 0,
      currency: productCurrency,
    }));

    const shippingAddress = {
      country: form.country,
      name: form.name,
      phone: form.phone,
      address1: form.address1,
      address2: form.address2,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      notes: form.notes,
    };

    return {
      amount: total,
      currency: productCurrency,
      customerName: form.name,
      customerEmail: user?.email || '',
      orderId: `ORDER-${Date.now()}`,
      productSlug,
      currentUrl,
      items: checkoutItems,
      shippingAddress,
      shippingRegion: selectedRegion,
      shippingCost,
    };
  };

  // Stripe Checkout integration
  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      const payload = buildCheckoutPayload();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/stripe/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.url && data.id) {
        localStorage.setItem('stripeSessionId', data.id);
        window.location.href = data.url;
        return;
      }
      setPopupError(data?.error || 'Failed to create Stripe payment session');
    } catch (err) {
      setPopupError(err instanceof Error ? err.message : 'Failed to create Stripe payment session');
    } finally {
      setLoading(false);
    }
  };

  const createPaypalOrder = async () => {
    const payload = buildCheckoutPayload();

    const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok || !data?.orderID) {
      throw new Error(data?.error || 'Failed to create PayPal order');
    }
    return data.orderID as string;
  };

  const capturePaypalOrder = async (orderID: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/paypal/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderID })
    });

    const data = await response.json();
    if (!response.ok || data?.status !== 'complete') {
      throw new Error(data?.error || 'PayPal payment capture failed');
    }
    return data;
  };


  // Hitung subtotal dan total sesuai mode
  let subtotal = 0;
  let itemsToShow: CheckoutDisplayItem[] = [];
  if (directProduct) {
    subtotal = directProduct.price;
    itemsToShow = [directProduct];
  } else {
    subtotal = getTotalPrice();
    itemsToShow = cart;
  }
  const shippingCost = selectedRegion ? (shippingRegions.find(r => r.label === selectedRegion)?.cost || 0) : 0;
  const total = subtotal + shippingCost;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };


  if (cart.length === 0 && !directProduct) {
    return null;
  }

  return (
    <div className="checkout-page">
      {popupError && (
        <ErrorPopup message={popupError} onClose={() => setPopupError(null)} />
      )}
      <div className="container">
        {step === 1 && (
          <form className="shipping-form" onSubmit={handleSubmit} autoComplete="off" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="checkout-form-grid">
              {/* Country */}
              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  name="country"
                  id="country"
                  value={form.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.country && touched.country ? 'input-error' : ''}
                  placeholder="Enter your country"
                  required
                />
                {/* error-message removed, handled by popup */}
              </div>
              {/* Region Dropdown */}
              <div className="form-group">
                <label htmlFor="region">Region *</label>
                <select
                  name="region"
                  id="region"
                  value={selectedRegion}
                  onChange={e => setSelectedRegion(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, region: true }))}
                  className={errors.region && touched.region ? 'input-error' : ''}
                  required
                >
                  <option value="">Select region</option>
                  {shippingRegions.map(region => (
                    <option key={region.label} value={region.label}>{region.label}</option>
                  ))}
                </select>
                {/* error-message removed, handled by popup */}
              </div>
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.name && touched.name ? 'input-error' : ''}
                  required
                />
                {/* error-message removed, handled by popup */}
              </div>
              {/* Phone Number */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.phone && touched.phone ? 'input-error' : ''}
                  required
                  placeholder="e.g. +62 81234567890"
                />
                {/* error-message removed, handled by popup */}
              </div>
              {/* Address Line 1 */}
              <div className="form-group">
                <label htmlFor="address1">Address Line 1 *</label>
                <input
                  type="text"
                  name="address1"
                  id="address1"
                  value={form.address1}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.address1 && touched.address1 ? 'input-error' : ''}
                  required
                  placeholder="Street address, P.O. box, company name, c/o"
                />
                {/* error-message removed, handled by popup */}
              </div>
              {/* Address Line 2 */}
              <div className="form-group">
                <label htmlFor="address2">Address Line 2</label>
                <input
                  type="text"
                  name="address2"
                  id="address2"
                  value={form.address2}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Apartment, suite, unit, building, floor, etc. (optional)"
                />
              </div>
              {/* City */}
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={form.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.city && touched.city ? 'input-error' : ''}
                  required
                />
                {/* error-message removed, handled by popup */}
              </div>
              {/* State/Province/Region */}
              <div className="form-group">
                <label htmlFor="state">State/Province/Region *</label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  value={form.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.state && touched.state ? 'input-error' : ''}
                  required
                />
                {/* error-message removed, handled by popup */}
              </div>
              {/* Postal/ZIP Code */}
              <div className="form-group">
                <label htmlFor="postalCode">Postal/ZIP Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  id="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.postalCode && touched.postalCode ? 'input-error' : ''}
                  required
                />
                {/* error-message removed, handled by popup */}
              </div>
              {/* Additional Notes */}
              <div className="form-group full-width">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  name="notes"
                  id="notes"
                  value={form.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={2}
                  placeholder="Notes for courier (optional)"
                />
              </div>
            </div>
            {/* Shipping Method Info (read-only) */}
            <div style={{ margin: '32px 0 0 0' }}>
              <label htmlFor="shipping-method" style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Shipping Method</label>
              <input
                id="shipping-method"
                type="text"
                value={selectedRegion ? `Economy International (${formatPrice(shippingCost)})` : ''}
                readOnly
                style={{ width: '100%', padding: '12px 16px', fontSize: 16, border: '1.5px solid #ddd', borderRadius: 8, background: '#f3f4f6', color: '#222', marginBottom: 8 }}
                placeholder="Shipping method will appear here"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} disabled={loading}>
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </form>
        )}
        {step === 2 && (
          <div className="checkout-step">
            <h2>Order Summary</h2>
            <div className="order-summary">
              <div className="summary-section">
                <h3>Produk</h3>
                {itemsToShow.map((item) => (
                  <div key={`${item._id}-${item.sku || ''}`} className="summary-item">
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-qty">x{item.quantity ? item.quantity : 1}</div>
                    </div>
                    <div className="item-price">{formatPrice((item.price || 0) * (item.quantity ? item.quantity : 1))}</div>
                  </div>
                ))}
              </div>
              <div className="summary-section">
                <h3>Shipping</h3>
                <div className="summary-item">
                  <div className="item-info">
                    <div className="item-name">{form.name}</div>
                    <div className="item-region">Region: {selectedRegion}</div>
                    <div className="item-address">{form.address1}, {form.city}, {form.state}, {form.country}</div>
                  </div>
                  <div className="item-price">{formatPrice(shippingCost)}</div>
                </div>
              </div>
              <div className="summary-total">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                <div className="total-row total-final">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
            <div style={{ margin: '32px 0 16px 0' }}>
              <label htmlFor="shipping-method" style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Shipping Method</label>
              <input
                id="shipping-method"
                type="text"
                value={selectedRegion ? `Economy International (${formatPrice(shippingCost)})` : ''}
                readOnly
                style={{ width: '100%', padding: '12px 16px', fontSize: 16, border: '1.5px solid #ddd', borderRadius: 8, background: '#f3f4f6', color: '#222', marginBottom: 8 }}
                placeholder="Shipping method will appear here"
              />
            </div>

            <div style={{ margin: '20px 0 8px 0' }}>
              <label style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, display: 'block' }}>Select Payment Method</label>
              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                  />
                  Credit Card (Stripe)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                  />
                  PayPal
                </label>
              </div>
            </div>

            <div className="payment-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              {paymentMethod === 'stripe' && (
                <button className="btn btn-primary" onClick={handleStripeCheckout} disabled={loading}>
                  {loading ? 'Processing...' : 'Pay with Stripe'}
                </button>
              )}
            </div>

            {paymentMethod === 'paypal' && (
              <div style={{ marginTop: 16 }}>
                {import.meta.env.VITE_PAYPAL_CLIENT_ID ? (
                  <PayPalScriptProvider
                    options={{
                      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                      currency: 'USD',
                      intent: 'capture',
                    }}
                  >
                    <PayPalButtons
                      style={{ layout: 'vertical', shape: 'rect', label: 'paypal' }}
                      createOrder={async () => createPaypalOrder()}
                      onApprove={async (data) => {
                        try {
                          const approvedOrderId = data.orderID;
                          if (!approvedOrderId) {
                            throw new Error('PayPal order ID not found');
                          }
                          await capturePaypalOrder(approvedOrderId);
                          navigate(`/payment-success?provider=paypal&orderID=${approvedOrderId}`);
                        } catch (err) {
                          setPopupError(err instanceof Error ? err.message : 'PayPal payment failed');
                        }
                      }}
                      onError={() => {
                        setPopupError('PayPal checkout encountered an error');
                      }}
                    />
                  </PayPalScriptProvider>
                ) : (
                  <div className="error-message">
                    <p>PayPal is not configured. Set VITE_PAYPAL_CLIENT_ID in frontend environment.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
