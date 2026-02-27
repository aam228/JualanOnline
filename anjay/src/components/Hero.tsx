import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector('#features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content animate-fade" style={{ animationDelay: "0.2s" }}>
          <h1>Transformasi Digital untuk Bisnis Anda</h1>
          <p>
            Kami menghadirkan solusi teknologi inovatif yang mendorong pertumbuhan, 
            meningkatkan efisiensi, dan memberdayakan tim Anda mencapai hasil luar biasa.
          </p>
          <div className="hero-buttons">
            <a href="#" className="btn">Mulai Sekarang</a>
            <a href="#features" className="btn btn-outline" onClick={scrollToFeatures}>Lihat Solusi</a>
          </div>
        </div>
      </div>
      <div className="hero-image">
        <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="hero-svg">
          <circle cx="250" cy="250" r="200" fill="url(#gradient)" className="pulse" />
          <circle cx="250" cy="250" r="150" fill="url(#gradient2)" opacity="0.6" className="pulse-delay" />
          <circle cx="250" cy="250" r="100" fill="url(#gradient3)" opacity="0.4" className="pulse-delay-2" />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4361ee" />
              <stop offset="100%" stopColor="#4cc9f0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4895ef" />
              <stop offset="100%" stopColor="#4cc9f0" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4cc9f0" />
              <stop offset="100%" stopColor="#4361ee" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
