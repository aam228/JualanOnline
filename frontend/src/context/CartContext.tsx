import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

const CART_STORAGE_KEY = 'shoppingCart';

export interface CartItem {
  _id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  currency?: string;
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

const getCartItemId = (item: Pick<CartItem, '_id' | 'sku'>) => (item.sku ? `${item._id}-${item.sku}` : item._id);

const isValidCartItem = (item: unknown): item is CartItem => {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Partial<CartItem>;

  return (
    typeof candidate._id === 'string' &&
    typeof candidate.slug === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.price === 'number' &&
    Number.isFinite(candidate.price) &&
    typeof candidate.image === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.stock === 'number' &&
    Number.isFinite(candidate.stock) &&
    typeof candidate.quantity === 'number' &&
    Number.isFinite(candidate.quantity) &&
    candidate.quantity > 0
  );
};

const normalizeCartItems = (items: CartItem[]): CartItem[] => {
  const mergedById = new Map<string, CartItem>();

  for (const item of items) {
    const itemId = getCartItemId(item);
    const existing = mergedById.get(itemId);

    if (existing) {
      mergedById.set(itemId, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
      continue;
    }

    mergedById.set(itemId, item);
  }

  return Array.from(mergedById.values());
};

const loadInitialCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const safeItems = parsed.filter(isValidCartItem);
    return normalizeCartItems(safeItems);
  } catch (error) {
    console.warn('Invalid cart data in localStorage, resetting cart.', error);
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [cart, setCart] = useState<CartItem[]>(loadInitialCart);
  const [toast, setToast] = useState<ToastNotification>({
    show: false,
    message: '',
    productName: ''
  });
  const hasLoadedRemoteCart = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to persist cart to localStorage:', error);
    }
  }, [cart]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !token) {
      hasLoadedRemoteCart.current = false;
      return;
    }

    if (hasLoadedRemoteCart.current) return;

    let cancelled = false;

    const loadRemoteCart = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const remoteItems = Array.isArray(data?.items) ? data.items.filter(isValidCartItem) : [];

        if (cancelled) return;

        setCart((prevCart) => normalizeCartItems([...prevCart, ...remoteItems]));
        hasLoadedRemoteCart.current = true;
      } catch (error) {
        console.error('Failed to load cart from backend:', error);
      }
    };

    loadRemoteCart();

    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL, authLoading, isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated || !token || !hasLoadedRemoteCart.current) return;

    const saveRemoteCart = async () => {
      try {
        await fetch(`${API_BASE_URL}/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items: cart }),
        });
      } catch (error) {
        console.error('Failed to sync cart to backend:', error);
      }
    };

    saveRemoteCart();
  }, [API_BASE_URL, cart, isAuthenticated, token]);

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
      const cartItemId = getCartItemId(product);
      const existingItem = prevCart.find(item => {
        const itemId = getCartItemId(item);
        return itemId === cartItemId;
      });
      
      if (existingItem) {
        setToast({
          show: true,
          message: 'Produk berhasil ditambahkan ke keranjang',
          productName: product.name
        });
        return prevCart.map(item => {
          const itemId = getCartItemId(item);
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
      const itemId = getCartItemId(item);
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
        const itemId = getCartItemId(item);
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
