import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingBag, FiUser } from 'react-icons/fi';
import './MobileNav.css';

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', icon: <FiHome size={20} />, path: '/' },
    { id: 'category', label: 'Category', icon: <FiGrid size={20} />, path: '#' },
    { id: 'shop', label: 'Shop', icon: <FiShoppingBag size={20} />, path: '#' },
    { id: 'account', label: 'Account', icon: <FiUser size={20} />, path: '#' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.path === '#') {
      return;
    }
    navigate(item.path);
  };

  return (
    <nav className="mobile-nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => handleNavClick(item)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileNav;
