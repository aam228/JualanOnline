import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/payment';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentIntentId = location.state?.paymentIntentId;

  useEffect(() => {
    if (!paymentIntentId) {
      setError('No payment data found');
      setLoading(false);
      return;
    }

    const fetchPaymentStatus = async () => {
      try {
        const data = await paymentAPI.getPaymentStatus(paymentIntentId);
        setPaymentData(data);
        
        if (data.status !== 'succeeded') {
          setError(`Payment status: ${data.status}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch payment status');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [paymentIntentId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
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

  if (error || !paymentData || paymentData.status !== 'succeeded') {
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

        {/* Order Details */}
        <div className="order-details">
          <div className="detail-row">
            <span className="label">Order ID</span>
            <span className="value">{paymentData.order?.orderId || paymentIntentId}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Jumlah Pembayaran</span>
            <span className="value amount">{formatPrice(paymentData.amount)}</span>
          </div>

          <div className="detail-row">
            <span className="label">Status Pembayaran</span>
            <span className="value status-badge">
              {paymentData.status === 'succeeded' ? 'Berhasil' : paymentData.status}
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
