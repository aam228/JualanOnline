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
      </div>
    </div>
  );
};

export default ContactPage;
