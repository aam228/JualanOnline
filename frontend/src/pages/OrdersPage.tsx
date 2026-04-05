import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OrdersPage.css';

interface Order {
  id?: string;
  orderId: string;
  stripeSessionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'paid';
  customerEmail: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  paymentIntent?: string;
  paymentMethod?: string;
  failureReason?: string;
}

const OrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, token } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch orders if user is authenticated and has token
    if (authLoading || !token) {
      return;
    }

    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call authenticated endpoint - server extracts email from JWT token
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/payments/orders`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Orders fetched from Stripe:', data);
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [token, isAuthenticated, authLoading, navigate]);

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
      case 'paid':
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
      case 'paid':
        return 'Pembayaran Berhasil';
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'failed':
        return 'Pembayaran Gagal';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return '✓';
      case 'pending':
        return '⏱';
      case 'failed':
        return '✕';
      default:
        return '•';
    }
  };

  const formatPaymentMethod = (method?: string) => {
    if (!method) return 'Metode tidak tersedia';
    const methodMap: { [key: string]: string } = {
      'card': 'Kartu Kredit/Debit',
      'id_bank_transfer': 'Transfer Bank',
      'bank_transfer': 'Transfer Bank',
      'wallet': 'E-Wallet',
      'ideal': 'iDEAL (Netherlands)',
    };
    return methodMap[method.toLowerCase()] || method;
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h1>Riwayat Pesanan</h1>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Memuat riwayat pesanan Anda...</p>
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
            <div className="empty-icon">🛍️</div>
            <p className="empty-title">Belum ada pesanan</p>
            <p className="empty-subtitle">
              Anda belum pernah melakukan pembelian. Mulai berbelanja sekarang untuk melihat riwayat pesanan Anda.
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
        {orders.length > 0 && (
          <div className="orders-summary">
            <div className="summary-item">
              <span className="summary-label">Total Pesanan</span>
              <span className="summary-value">{orders.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Pembelian</span>
              <span className="summary-value">
                {formatPrice(
                  orders.reduce((sum, order) => sum + order.amount, 0),
                  orders[0]?.currency || 'IDR'
                )}
              </span>
            </div>
          </div>
        )}

        <div className="orders-list">
          {orders.map((order, index) => (
            <div key={order.id || order.orderId} className="order-card">
              {/* Status Badge Top */}
              <div className="order-status-section">
                <div className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                  <span className="status-icon">{getStatusIcon(order.status)}</span>
                  <span className="status-text">{getStatusLabel(order.status)}</span>
                </div>
              </div>

              {/* Order Identifier */}
              <div className="order-number">
                Pesanan #{String(index + 1).padStart(3, '0')}
              </div>

              {/* Total Amount - PROMINENT */}
              <div className="order-amount-section">
                <span className="amount-label">Total Pembayaran</span>
                <span className="amount-value">{formatPrice(order.amount, order.currency)}</span>
              </div>

              {/* Order Details Grid */}
              <div className="order-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Tanggal Pesanan</span>
                  <span className="detail-value">{formatDate(order.createdAt)}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Metode Pembayaran</span>
                  <span className="detail-value capitalize">{formatPaymentMethod(order.paymentMethod)}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email Pelanggan</span>
                  <span className="detail-value">{order.customerEmail}</span>
                </div>
              </div>

              {/* Failure Reason - Only if failed */}
              {order.status === 'failed' && order.failureReason && (
                <div className="order-failure-reason">
                  <span className="failure-label">⚠️ Alasan Pembayaran Gagal</span>
                  <span className="failure-text">{order.failureReason}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="order-actions">
                {order.status === 'failed' ? (
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="btn-retry-payment"
                  >
                    Ulangi Pembayaran
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/')}
                    className="btn-view-details"
                  >
                    Lihat Pesanan
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
