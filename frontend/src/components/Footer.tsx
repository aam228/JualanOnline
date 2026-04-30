
import { FiShoppingBag, FiInstagram, FiFacebook, FiMessageCircle, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-about">
            <div className="footer-logo">
              <FiShoppingBag size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              TechMart
            </div>
            <p>A trusted marketplace for your technology needs. Quality products, great prices, and fast shipping.</p>
            <div className="social-links">
              <a href="#" aria-label="Instagram"><FiInstagram size={18} /></a>
              <a href="#" aria-label="Facebook"><FiFacebook size={18} /></a>
              <a href="#" aria-label="WhatsApp"><FiMessageCircle size={18} /></a>
              <a href="#" aria-label="Email"><FiMail size={18} /></a>
            </div>
          </div>
          <div className="footer-links">
            <h3>Categories</h3>
            <ul>
              <li><a href="#">Electronics</a></li>
              <li><a href="#">Audio</a></li>
              <li><a href="#">Wearables</a></li>
              <li><a href="#">Accessories</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h3>Help</h3>
            <ul>
              <li><a href="#">How to Shop</a></li>
              <li><a href="#">Payments</a></li>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Returns & Warranty</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h3>About</h3>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} TechMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
