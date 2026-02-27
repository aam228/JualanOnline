
import React, { useState } from 'react';
import './Features.css';

const Features: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: '🚀',
      title: 'Pengembangan Cepat',
      description: 'Percepat timeline proyek Anda dengan proses pengembangan yang efisien dan metodologi terbukti.'
    },
    {
      icon: '💡',
      title: 'Inovasi Terdepan',
      description: 'Tetap unggul dengan solusi teknologi mutakhir yang disesuaikan dengan kebutuhan bisnis Anda.'
    },
    {
      icon: '🎯',
      title: 'Fokus pada Tujuan',
      description: 'Kami fokus memberikan hasil terukur yang selaras dengan objektif bisnis Anda.'
    },
    {
      icon: '🤝',
      title: 'Dukungan Penuh',
      description: 'Tim ahli siap membantu Anda 24/7 di setiap langkah perjalanan Anda.'
    },
    {
      icon: '🔒',
      title: 'Keamanan Enterprise',
      description: 'Protokol keamanan tingkat bank untuk melindungi data dan memastikan kepatuhan.'
    },
    {
      icon: '📊',
      title: 'Analitik & Insight',
      description: 'Analitik real-time dan pelaporan untuk membuat keputusan berbasis data dengan percaya diri.'
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title animate-fade">Mengapa Memilih Kami</h2>
        <p className="section-subtitle animate-fade" style={{ animationDelay: "0.2s" }}>
          Solusi komprehensif yang dirancang untuk mengangkat bisnis Anda
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card animate-fade ${hoveredIndex === index ? 'hovered' : ''}`}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
