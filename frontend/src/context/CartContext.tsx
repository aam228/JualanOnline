import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  quantity: number;
  selectedVariants?: { [key: string]: string };
  sku?: string;
}

interface ToastNotification {
  show: boolean;
  message: string;
  productName: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  toast: ToastNotification;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<ToastNotification>({
    show: false,
    message: '',
    productName: ''
  });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', productName: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCart(prevCart => {
      // Create unique ID based on product ID and SKU
      const cartItemId = product.sku ? `${product._id}-${product.sku}` : product._id;
      const existingItem = prevCart.find(item => {
        const itemId = item.sku ? `${item._id}-${item.sku}` : item._id;
        return itemId === cartItemId;
      });
      
      if (existingItem) {
        setToast({
          show: true,
          message: 'Produk berhasil ditambahkan ke keranjang',
          productName: product.name
        });
        return prevCart.map(item => {
          const itemId = item.sku ? `${item._id}-${item.sku}` : item._id;
          return itemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        });
      }
      
      setToast({
        show: true,
        message: 'Produk berhasil ditambahkan ke keranjang',
        productName: product.name
      });
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prevCart => prevCart.filter(item => {
      const itemId = item.sku ? `${item._id}-${item.sku}` : item._id;
      return itemId !== cartItemId;
    }));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item => {
        const itemId = item.sku ? `${item._id}-${item.sku}` : item._id;
        return itemId === cartItemId ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        toast,
      }}
    >
      {children}
      {toast.show && (
        <div className="cart-toast">
          <div className="toast-icon">✓</div>
          <div className="toast-content">
            <div className="toast-title">{toast.message}</div>
            <div className="toast-product">{toast.productName}</div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
