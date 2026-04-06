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
  const hasRedirectedRef = useRef(false);

  // ✅ FIX: Get session ID from URL query params or localStorage
  const queryParams = new URLSearchParams(location.search);
  const sessionIdFromUrl = queryParams.get('session_id');
  const sessionIdFromStorage = localStorage.getItem('stripeSessionId');
  const sessionId = sessionIdFromUrl || sessionIdFromStorage;

  useEffect(() => {
    if (!sessionId) {
      setError('No payment session found');
      setLoading(false);
      return;
    }

    const fetchPaymentStatus = async () => {
      try {
        // Fetch session details from backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/session/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment session');
        }
        const data = await response.json();
        setPaymentData(data);
        
        if (data.status === 'complete') {
          // ✅ Clear cart on successful payment
          clearCart();
        } else {
          setError(`Payment status: ${data.status}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
    
    // Clear session ID from localStorage
    if (sessionIdFromUrl) {
      localStorage.removeItem('stripeSessionId');
    }
  }, [sessionId, sessionIdFromUrl, sessionIdFromStorage, clearCart]);

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

  const sellerWaNumber = import.meta.env.VITE_SELLER_WHATSAPP_NUMBER || '';

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

    if (!sellerWaNumber || hasRedirectedRef.current) {
      return;
    }

    const message = buildWhatsAppMessage();
    const targetUrl = `https://wa.me/${sellerWaNumber}?text=${encodeURIComponent(message)}`;
    setWaUrl(targetUrl);

    hasRedirectedRef.current = true;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }, [loading, error, paymentData, sellerWaNumber]);

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
        <div className="icon success-icon">✓</div>
        <h1>Pembayaran Berhasil!</h1>
        <p className="status-message">Terima kasih telah melakukan pembayaran</p>
        <p className="status-message">Anda akan diarahkan otomatis ke WhatsApp untuk mengirim data transaksi.</p>

        {/* Order Details */}
        <div className="order-details">
          <div className="detail-row">
            <span className="label">Order ID</span>
            <span className="value">{paymentData.order?.orderId || sessionId}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Jumlah Pembayaran</span>
            <span className="value amount">{formatPrice(paymentData.amount)}</span>
          </div>

          <div className="detail-row">
            <span className="label">Status Pembayaran</span>
            <span className="value status-badge">
              {paymentData.status === 'complete' ? 'Berhasil' : paymentData.status}
            </span>
          </div>

          {paymentData.order && (
            <>
              <div className="detail-row">
                <span className="label">Nama Pelanggan</span>
                <span className="value">{paymentData.order.customerName}</span>
              </div>

              <div className="detail-row">
                <span className="label">Email</span>
                <span className="value">{paymentData.order.customerEmail}</span>
              </div>

              <div className="detail-row">
                <span className="label">Tanggal Pembayaran</span>
                <span className="value">{formatDate(paymentData.order.createdAt)}</span>
              </div>
            </>
          )}
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h3>Langkah Selanjutnya</h3>
          <ol>
            <li>Anda akan menerima email konfirmasi pembayaran</li>
            <li>Pesanan Anda akan segera diproses</li>
            <li>Barang akan dikirim sesuai jadwal pengiriman yang dipilih</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {waUrl && (
            <button onClick={() => window.open(waUrl, '_blank', 'noopener,noreferrer')} className="btn-orders">
              Buka WhatsApp Sekarang
            </button>
          )}
          <button onClick={() => navigate('/orders')} className="btn-orders">
            Lihat Pesanan Saya
          </button>
          <button onClick={() => navigate('/')} className="btn-home">
            Kembali ke Beranda
          </button>
        </div>

        {/* Support */}
        <div className="support-info">
          <p>Ada pertanyaan? <a href="mailto:support@example.com">Hubungi kami</a></p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
