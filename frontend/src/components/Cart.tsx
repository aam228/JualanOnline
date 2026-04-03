import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiX, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import './Cart.css';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCartItemId = (item: any) => {
    return item.sku ? `${item._id}-${item.sku}` : item._id;
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2><FiShoppingCart size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Keranjang Belanja</h2>
          <button className="cart-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <FiShoppingCart size={64} color="#9CA3AF" />
              <p>Keranjang masih kosong</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => {
                  const itemId = getCartItemId(item);
                  return (
                    <div key={itemId} className="cart-item">
                      <div className="cart-item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="cart-item-variants">
                            {Object.entries(item.selectedVariants).map(([key, value]) => (
                              <span key={key} className="cart-variant-tag">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="cart-item-price">{formatPrice(item.price)}</p>
                        <div className="cart-item-quantity">
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity - 1)}
                            className="qty-btn"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity + 1)}
                            className="qty-btn"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(itemId)}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="total-price">{formatPrice(getTotalPrice())}</span>
                </div>
                <button className="btn btn-checkout" onClick={handleCheckout}>Checkout</button>
                <button className="btn btn-clear" onClick={clearCart}>
                  Kosongkan Keranjang
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
