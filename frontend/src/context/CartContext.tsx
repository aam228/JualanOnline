import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getApiBaseUrl } from '../utils/apiUrl';

const CART_STORAGE_KEY = 'shoppingCart';

// ==========================================
// DEBUG LOGGING UTILITY (can be toggled globally)
// ==========================================
const DEBUG_CART = true; // Set to false to disable verbose logs

function logCartDebug(title: string, data?: any) {
  if (DEBUG_CART) {
    if (data !== undefined) {
      console.log(`[CART DEBUG] ${title}`, data);
    } else {
      console.log(`[CART DEBUG] ${title}`);
    }
  }
}

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

const toSafeString = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);

const toSafeNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const buildSyncCartPayload = (items: CartItem[]) => ({
  items: items.map((item) => ({
    _id: toSafeString(item._id),
    slug: toSafeString(item.slug, toSafeString(item._id)),
    name: toSafeString(item.name, 'Untitled Product'),
    price: toSafeNumber(item.price, 0),
    image: toSafeString(item.image),
    category: toSafeString(item.category),
    description: toSafeString(item.description),
    stock: toSafeNumber(item.stock, 0),
    currency: toSafeString(item.currency, 'IDR'),
    quantity: toSafeNumber(item.quantity, 1),
    selectedVariants: item.selectedVariants && typeof item.selectedVariants === 'object' ? item.selectedVariants : undefined,
    sku: toSafeString(item.sku),
  })),
});

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
  const API_BASE_URL = getApiBaseUrl();

  const [cart, setCart] = useState<CartItem[]>(loadInitialCart);
  const [toast, setToast] = useState<ToastNotification>({
    show: false,
    message: '',
    productName: ''
  });
  const hasLoadedRemoteCart = useRef(false);

  // ==========================================
  // EFFECT 1: Auto-save cart to localStorage
  // ==========================================
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      logCartDebug('Saved cart to localStorage, items:', cart.length);
    } catch (error) {
      console.error('❌ Failed to persist cart to localStorage:', error);
    }
  }, [cart]);

  // ==========================================
  // EFFECT 2: Load cart from backend when user logs in
  // ==========================================
  useEffect(() => {
    // Skip if auth is still loading
    if (authLoading) {
      logCartDebug('Auth still loading, skipping remote cart load');
      return;
    }

    // If not authenticated, reset the flag for next login
    if (!isAuthenticated || !token) {
      logCartDebug('User not authenticated, resetting remote cart flag');
      hasLoadedRemoteCart.current = false;
      return;
    }

    // If already loaded, don't fetch again
    if (hasLoadedRemoteCart.current) {
      logCartDebug('Remote cart already loaded, skipping duplicate load');
      return;
    }

    let cancelled = false;

    const loadRemoteCart = async () => {
      logCartDebug('Starting remote cart load...');
      try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.warn(`⚠️ Backend returned ${response.status}:`, response.statusText);
          logCartDebug('Backend cart fetch failed:', response.status);
          // If 401, token is invalid - will be handled by auth context
          // If 404 or other errors, treat as empty cart (first-time user)
          hasLoadedRemoteCart.current = true;
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          console.warn('⚠️ Backend response is not JSON');
          return;
        }

        const data = await response.json();
        logCartDebug('Backend returned cart:', data);

        if (cancelled) {
          logCartDebug('Cart load cancelled (component unmounted)');
          return;
        }

        // Validate remote items
        const remoteItems = Array.isArray(data?.items) 
          ? data.items.filter(isValidCartItem) 
          : [];
        
        const removedCount = (data?.items?.length || 0) - remoteItems.length;
        if (removedCount > 0) {
          console.warn(`⚠️ Removed ${removedCount} invalid items from remote cart`);
        }

        logCartDebug('Valid remote items:', remoteItems.length);

        // Merge with local cart: local items take precedence (they're fresher)
        setCart((prevCart) => {
          const merged = normalizeCartItems([...remoteItems, ...prevCart]);
          logCartDebug('Merged cart (remote + local):', merged.length);
          return merged;
        });

        hasLoadedRemoteCart.current = true;
        console.log('✅ Remote cart loaded and merged successfully');
      } catch (error) {
        console.error('❌ Error loading cart from backend:', error);
        logCartDebug('Fetch error details:', {
          url: `${API_BASE_URL}/cart`,
          errorMessage: error instanceof Error ? error.message : String(error)
        });
        // Don't fail silently - at least log it
        hasLoadedRemoteCart.current = true;
      }
    };

    loadRemoteCart();

    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL, authLoading, isAuthenticated, token]);

  // ==========================================
  // EFFECT 3: Auto-sync cart to backend (debounced)
  // ==========================================
  useEffect(() => {
    // Only sync if user is authenticated AND remote cart was already loaded
    if (!isAuthenticated || !token || !hasLoadedRemoteCart.current) {
      logCartDebug('Sync skipped: auth/token/loaded check failed');
      return;
    }

    logCartDebug('Syncing cart to backend, items:', cart.length);

    const saveRemoteCart = async () => {
      try {
        const cartData = buildSyncCartPayload(cart);
        console.log('[CART DEBUG] syncCartToBackend payload:', JSON.stringify(cartData));

        const response = await fetch(`${API_BASE_URL}/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cartData),
        });

        if (!response.ok) {
          console.warn(`⚠️ Backend rejected cart sync (${response.status}):`, response.statusText);
          logCartDebug('Cart sync failed:', response.status);
          return;
        }

        const responseData = await response.json();
        logCartDebug('Cart sync success response:', responseData);

        logCartDebug('✅ Cart synced to backend');
      } catch (error) {
        console.error('❌ Failed to sync cart to backend:', error);
        logCartDebug('Sync error details:', {
          url: `${API_BASE_URL}/cart`,
          errorMessage: error instanceof Error ? error.message : String(error)
        });
      }
    };

    saveRemoteCart();
  }, [API_BASE_URL, cart, isAuthenticated, token]);

  // ==========================================
  // EFFECT 4: Toast auto-hide
  // ==========================================
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', productName: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    const safePrice = toSafeNumber(product.price, 0);
    if (safePrice <= 0) {
      console.error('[CART DEBUG] addToCart blocked due to invalid price:', product);
      setToast({
        show: true,
        message: 'Invalid product price. Unable to add to cart.',
        productName: product.name,
      });
      return;
    }

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
          message: 'Product added to cart successfully',
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
        message: 'Product added to cart successfully',
        productName: product.name
      });
      return [...prevCart, { ...product, price: safePrice, quantity: 1 }];
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
