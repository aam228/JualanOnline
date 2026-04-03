import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiSearch, FiLogOut } from 'react-icons/fi';
import './Header.css';

interface HeaderProps {
  onCartClick: () => void;
}

const Header = ({ onCartClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { getTotalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-search">
          <FiSearch className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="header-actions">
          <span className="user-status">Logged in as <strong>admin</strong></span>
          
          <button className="logout-btn" aria-label="Log out">
            <FiLogOut size={16} />
            <span>Log out</span>
          </button>

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
