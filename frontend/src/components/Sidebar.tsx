import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingBag, FiHelpCircle, FiInstagram } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'home', label: 'HOME', icon: <FiHome size={18} />, path: '/' },
    { id: 'all', label: 'ALL', icon: <FiGrid size={18} />, path: '/all' },
    { id: 'collections', label: 'COLLECTIONS', icon: <FiShoppingBag size={18} />, path: '/collections' },
    { id: 'faqs', label: 'FAQs', icon: <FiHelpCircle size={18} />, path: '#' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.path === '#') {
      return;
    }
    navigate(item.path);
  };

  const isActive = (path: string) => {
    if (path === '#') return false;
    return location.pathname === path;
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => handleMenuClick(item)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        
        <div className="sidebar-divider"></div>
        
        <a 
          href="https://instagram.com/adamkenapa" 
          target="_blank" 
          rel="noopener noreferrer"
          className="sidebar-item sidebar-social"
        >
          <FiInstagram className="icon-sidebar" size={24} />
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
