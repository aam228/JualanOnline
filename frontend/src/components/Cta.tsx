
import React from 'react';
import './Cta.css';

const Cta: React.FC = () => {
  return (
    <section className="cta">
      <div className="container">
        <h2 className="animate-fade">Siap Merevolusi Cara Kerja Anda?</h2>
        <p className="animate-fade" style={{ animationDelay: "0.2s" }}>
          Bergabunglah dengan ribuan developer dan desainer yang sudah membangun lebih cepat dengan platform kami.
        </p>
        <div className="cta-buttons animate-fade" style={{ animationDelay: "0.4s" }}>
          <a href="#" className="btn">Coba Gratis</a>
          <a href="#" className="btn btn-outline">Lihat Harga</a>
        </div>
      </div>
    </section>
  );
};

export default Cta;
