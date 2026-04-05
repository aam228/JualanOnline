import { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!name || !email || !message) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }

    // Here you would typically send the form data to a backend API
    // For now, we'll just show a success message
    console.log('Form submitted:', { name, email, message });
    
    setSubmitStatus('success');
    setName('');
    setEmail('');
    setMessage('');
    
    setTimeout(() => setSubmitStatus('idle'), 3000);
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Hero / Header Section */}
        <div className="contact-header">
          <h1>Hubungi Kami</h1>
          <p className="contact-subtitle">
            Jika Anda memiliki pertanyaan mengenai produk, pesanan, atau kerja sama, jangan ragu untuk menghubungi kami melalui informasi kontak di bawah ini.
          </p>
        </div>

        {/* About Store Section */}
        <div className="about-store">
          <h2>Tentang Toko Kami</h2>
          <div className="about-content">
            <p>
              Kami adalah toko yang berfokus pada produk fashion dan streetwear pilihan. Setiap produk dipilih dengan standar kualitas tinggi untuk memastikan pelanggan mendapatkan produk terbaik.
            </p>
            <p>
              Kami percaya bahwa fashion bukan hanya tentang pakaian, tetapi juga tentang ekspresi diri dan gaya hidup. Melalui website ini, kami berkomitmen untuk memberikan pengalaman berbelanja yang terbaik dengan koleksi produk yang terseleksi dan layanan pelanggan yang responsif.
            </p>
            <p>
              Kepuasan pelanggan adalah prioritas utama kami. Terima kasih telah menjadi bagian dari keluarga besar toko kami!
            </p>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="contact-info-section">
          <h2>Informasi Kontak</h2>
          <div className="contact-cards">
            {/* Email Card */}
            <div className="contact-card">
              <div className="contact-icon">✉️</div>
              <h3>Email</h3>
              <a href="mailto:support@tokokamu.com" className="contact-value">
                support@tokokamu.com
              </a>
              <p className="contact-desc">Respon cepat dalam 24 jam</p>
            </div>

            {/* Phone Card */}
            <div className="contact-card">
              <div className="contact-icon">📱</div>
              <h3>Nomor Telepon</h3>
              <a href="tel:+62812345678" className="contact-value">
                +62 812 3456 7890
              </a>
              <p className="contact-desc">Hubungi kami via WhatsApp atau Telepon</p>
            </div>

            {/* Address Card */}
            <div className="contact-card">
              <div className="contact-icon">📍</div>
              <h3>Alamat</h3>
              <p className="contact-value">
                Jl. Contoh No. 123<br />
                Jakarta, Indonesia
              </p>
              <p className="contact-desc">Kunjungi toko fisik kami</p>
            </div>

            {/* Hours Card */}
            <div className="contact-card">
              <div className="contact-icon">🕐</div>
              <h3>Jam Operasional</h3>
              <p className="contact-value">
                Senin - Jumat<br />
                09.00 - 17.00 WIB
              </p>
              <p className="contact-desc">Libur: Sabtu, Minggu & Hari Libur Nasional</p>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="contact-form-section">
          <h2>Kirim Pesan kepada Kami</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                placeholder="Masukkan nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Pesan</label>
              <textarea
                id="message"
                placeholder="Tulis pesan Anda di sini..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {submitStatus === 'success' && (
              <div className="form-status success">
                ✓ Pesan berhasil dikirim! Kami akan meresponnya dalam waktu 24 jam.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="form-status error">
                ✕ Mohon isi semua kolom form terlebih dahulu.
              </div>
            )}

            <button type="submit" className="btn-submit">
              Kirim Pesan
            </button>
          </form>
        </div>

        {/* Quick Contact Links */}
        <div className="quick-contact">
          <h3>Cara Lain untuk Menghubungi Kami</h3>
          <div className="quick-links">
            <a href="mailto:support@tokokamu.com" className="quick-link email">
              Email
            </a>
            <a href="https://wa.me/62812345678" target="_blank" rel="noopener noreferrer" className="quick-link whatsapp">
              WhatsApp
            </a>
            <a href="tel:+62812345678" className="quick-link phone">
              Telepon
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
