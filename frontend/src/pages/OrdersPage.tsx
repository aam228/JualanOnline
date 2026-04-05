import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OrdersPage.css';

interface Order {
  _id?: string;
  orderId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  customerEmail: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
}

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch orders if user is authenticated
    if (authLoading || !user?.email) {
      return;
    }

    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/payments/user-orders/${encodeURIComponent(user.email)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user?.email, isAuthenticated, authLoading, navigate]);

  const formatPrice = (price: number, currency: string) => {
    const curr = currency || 'IDR';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-unknown';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Berhasil';
      case 'pending':
        return 'Menunggu';
      case 'failed':
        return 'Gagal';
      default:
        return status;
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h1>Riwayat Pesanan</h1>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Memuat pesanan Anda...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h1>Riwayat Pesanan</h1>
          <div className="error-message">
            <p>❌ {error}</p>
            <button onClick={() => window.location.reload()} className="btn-retry">
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h1>Riwayat Pesanan</h1>
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <p className="empty-title">Belum ada pesanan</p>
            <p className="empty-subtitle">
              Anda belum memiliki riwayat pesanan. Mulai berbelanja sekarang!
            </p>
            <button onClick={() => navigate('/')} className="btn-shop-now">
              Belanja Sekarang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Orders list
  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>Riwayat Pesanan</h1>
        <div className="orders-summary">
          <p>Total pesanan: <strong>{orders.length}</strong></p>
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id || order.orderId} className="order-card">
              <div className="order-header">
                <div className="order-id-section">
                  <span className="order-label">Order ID</span>
                  <span className="order-id">{order.orderId}</span>
                </div>
                <div className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                  {getStatusLabel(order.status)}
                </div>
              </div>

              <div className="order-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Jumlah Pembayaran</span>
                  <span className="detail-value amount">
                    {formatPrice(order.amount, order.currency)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Nama Pelanggan</span>
                  <span className="detail-value">{order.customerName}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{order.customerEmail}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Tanggal Pesanan</span>
                  <span className="detail-value">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              {order.status === 'failed' && order.failureReason && (
                <div className="order-failure-reason">
                  <span className="failure-label">Alasan Gagal:</span>
                  <span className="failure-text">{order.failureReason}</span>
                </div>
              )}

              <div className="order-actions">
                <button 
                  onClick={() => navigate(`/product/${order.orderId}`)}
                  className="btn-view-details"
                >
                  Lihat Detail
                </button>
                {order.status === 'failed' && (
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="btn-retry-payment"
                  >
                    Coba Pembayaran Ulang
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="orders-footer">
          <button onClick={() => navigate('/')} className="btn-back-home">
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
