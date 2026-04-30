import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productAPI, type Product } from '../services/api';
import { FiShoppingCart, FiSearch, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi';
import './Header.css';

interface HeaderProps {
  onCartClick: () => void;
}

const Header = ({ onCartClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { getTotalItems } = useCart();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const searchProducts = async () => {
      setLoading(true);
      try {
        const allProducts = await productAPI.getAll();
        const filtered = allProducts
          .filter(p => p.isPublished && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .slice(0, 8); // Limit to 8 results
        setSearchResults(filtered);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-search" ref={searchRef}>
          <FiSearch className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setShowDropdown(true)}
            className="search-input"
          />
          
          {showDropdown && (
            <div className="search-dropdown">
              {loading ? (
                <div className="search-loading">Searching...</div>
              ) : searchResults.length > 0 ? (
                <ul className="search-results">
                  {searchResults.map(product => (
                    <li key={product._id} className="search-result-item">
                      <button
                        onClick={() => handleSelectProduct(product._id)}
                        className="search-result-btn"
                      >
                        <div className="result-image">
                          {product.images?.[0]?.url && (
                            <img 
                              src={product.images[0].url} 
                              alt={product.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        <div className="result-info">
                          <div className="result-name">{product.name}</div>
                          <div className="result-price">
                            {product.price !== undefined && product.currency
                              ? new Intl.NumberFormat(product.currency === 'IDR' ? 'id-ID' : 'en-US', {
                                  style: 'currency',
                                  currency: product.currency,
                                  minimumFractionDigits: 0,
                                }).format(product.price)
                              : product.priceRange?.min
                              ? new Intl.NumberFormat(product.priceRange.currency === 'IDR' ? 'id-ID' : 'en-US', {
                                  style: 'currency',
                                  currency: product.priceRange.currency,
                                  minimumFractionDigits: 0,
                                }).format(product.priceRange.min)
                              : 'N/A'}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="search-no-results">No products found</div>
              )}
            </div>
          )}
        </div>

        <div className="header-actions">
          {isAuthenticated && user ? (
            <>
              <div className="user-menu" ref={userMenuRef}>
                <button 
                  className="user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                >
                  <FiUser size={18} />
                  <span>{user.name}</span>
                  <FiChevronDown size={16} />
                </button>
                
                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                    <div className="user-menu-divider"></div>
                    <button 
                      className="user-menu-item"
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                    >
                      Profile
                    </button>
                    <button 
                      className="user-menu-item"
                      onClick={() => {
                        navigate('/orders');
                        setShowUserMenu(false);
                      }}
                    >
                      Orders
                    </button>
                    <div className="user-menu-divider"></div>
                    <button 
                      className="user-menu-item logout"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate('/');
                      }}
                    >
                      <FiLogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button 
                className="auth-btn login-btn"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                className="auth-btn register-btn"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </>
          )}

          <button className="cart-btn" onClick={onCartClick} aria-label="Cart">
            <FiShoppingCart size={18} />
            <span>Cart ({getTotalItems()})</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
