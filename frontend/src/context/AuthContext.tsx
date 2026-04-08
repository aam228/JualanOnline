import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getApiBaseUrl } from '../utils/apiUrl';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  verifyToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = getApiBaseUrl();

  console.log('[AUTH] Using API URL:', API_BASE_URL);

  // Load token and user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('authUser');
      }
      // Verify token is still valid
      verifyTokenValidity(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Verify if token is still valid by calling /auth/me endpoint
  const verifyTokenValidity = async (authToken: string) => {
    try {
      console.log('[AUTH] Verifying token validity...');
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(authToken);
        console.log('[AUTH] ✅ Token verified successfully');
      } else {
        // Token invalid, clear storage
        console.warn('[AUTH] ⚠️ Token verification failed (invalid token)');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('[AUTH] ❌ Token verification error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    if (!token) return;
    await verifyTokenValidity(token);
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('[AUTH] Attempting login for:', email);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('[AUTH] ❌ Login failed:', data.error);
        return { 
          success: false, 
          message: data.error || 'Login failed' 
        };
      }

      // Save token and user to localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      console.log('[AUTH] ✅ Login successful for:', email);

      return { success: true };
    } catch (error) {
      console.error('[AUTH] ❌ Login error:', error);
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('[AUTH] Attempting register for:', email);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('[AUTH] ❌ Registration failed:', data.error);
        return { 
          success: false, 
          message: data.error || 'Registration failed' 
        };
      }

      // Save token and user to localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      console.log('[AUTH] ✅ Registration successful for:', email);

      return { success: true };
    } catch (error) {
      console.error('[AUTH] ❌ Register error:', error);
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      console.log('[AUTH] Logging out user');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('[AUTH] ❌ Logout error (continuing):', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setToken(null);
      setUser(null);
      console.log('[AUTH] ✅ Logout complete - auth state cleared');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin' || false,
        loading,
        login,
        register,
        logout,
        verifyToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
