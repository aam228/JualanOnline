import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingBag, FiHelpCircle, FiInstagram } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'home', label: 'HOME', icon: <FiHome size={18} />, path: '/', isActive: true },
    { id: 'all', label: 'ALL', icon: <FiGrid size={18} />, path: '#', isActive: false },
    { id: 'shop', label: 'SHOP', icon: <FiShoppingBag size={18} />, path: '#', isActive: false },
    { id: 'faqs', label: 'FAQs', icon: <FiHelpCircle size={18} />, path: '#', isActive: false },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.path === '#') {
      // Do nothing for non-active pages
      return;
    }
    navigate(item.path);
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${item.isActive && location.pathname === item.path ? 'active' : ''}`}
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
