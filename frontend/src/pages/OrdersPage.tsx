import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OrdersPage.css';

interface Order {
  id?: string;
  orderId: string;
  stripeSessionId?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  transactionId?: string;
  paymentProvider?: 'stripe' | 'paypal';
  paymentStatus?: string;
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
        return 'Completed';
      case 'pending':
        return 'Awaiting Payment';
      case 'failed':
        return 'Failed';
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
    if (!method) return 'Method unavailable';
    const methodMap: { [key: string]: string } = {
      'card': 'Credit/Debit Card',
      'paypal': 'PayPal',
      'id_bank_transfer': 'Bank Transfer',
      'bank_transfer': 'Bank Transfer',
      'wallet': 'E-Wallet',
      'ideal': 'iDEAL (Netherlands)',
    };
    return methodMap[method.toLowerCase()] || method;
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h1>Order History</h1>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your order history...</p>
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
          <h1>Order History</h1>
          <div className="error-message">
            <p>❌ {error}</p>
            <button onClick={() => window.location.reload()} className="btn-retry">
              Try Again
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
          <h1>Order History</h1>
          <div className="orders-empty">
            <div className="empty-icon">🛍️</div>
            <p className="empty-title">No orders yet</p>
            <p className="empty-subtitle">
              You have not made a purchase yet. Start shopping now to view your order history.
            </p>
            <button onClick={() => navigate('/')} className="btn-shop-now">
              Shop Now
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
        <h1>Order History</h1>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Order ID</th>
                <th>Transaction Date</th>
                <th>Provider</th>
                <th>Payment Method</th>
                <th>Transaction ID</th>
                <th>Payment Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id || order.orderId} className={index % 2 === 0 ? 'even' : 'odd'}>
                  <td className="col-no">{index + 1}</td>
                  <td className="col-order-id" onClick={() => copyToClipboard(order.orderId)} title="Click to copy Order ID">{order.orderId}</td>
                  <td className="col-date">{formatDate(order.createdAt)}</td>
                  <td className="col-method">{(order.paymentProvider || 'stripe').toUpperCase()}</td>
                  <td className="col-method">{formatPaymentMethod(order.paymentMethod)}</td>
                  <td className="col-order-id" title="Transaction ID">{order.transactionId || '-'}</td>
                  <td className="col-amount">{formatPrice(order.amount, order.currency)}</td>
                  <td className="col-status">
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      <span className="status-icon">{getStatusIcon(order.status)}</span>
                      <span className="status-text">{getStatusLabel(order.status)}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="orders-footer">
          <button onClick={() => navigate('/')} className="btn-back-home">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
