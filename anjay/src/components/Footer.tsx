
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
            <p>Marketplace terpercaya untuk kebutuhan teknologi Anda. Produk berkualitas dengan harga terbaik dan pengiriman cepat.</p>
            <div className="social-links">
              <a href="#" aria-label="Instagram"><FiInstagram size={18} /></a>
              <a href="#" aria-label="Facebook"><FiFacebook size={18} /></a>
              <a href="#" aria-label="WhatsApp"><FiMessageCircle size={18} /></a>
              <a href="#" aria-label="Email"><FiMail size={18} /></a>
            </div>
          </div>
          <div className="footer-links">
            <h3>Kategori</h3>
            <ul>
              <li><a href="#">Elektronik</a></li>
              <li><a href="#">Audio</a></li>
              <li><a href="#">Wearable</a></li>
              <li><a href="#">Aksesoris</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h3>Bantuan</h3>
            <ul>
              <li><a href="#">Cara Belanja</a></li>
              <li><a href="#">Pembayaran</a></li>
              <li><a href="#">Pengiriman</a></li>
              <li><a href="#">Retur & Garansi</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h3>Tentang</h3>
            <ul>
              <li><a href="#">Tentang Kami</a></li>
              <li><a href="#">Hubungi Kami</a></li>
              <li><a href="#">Kebijakan Privasi</a></li>
              <li><a href="#">Syarat & Ketentuan</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} TechMart. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
