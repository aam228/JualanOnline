import React, { useState } from 'react';
import './Testimonials.css';

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      content: "Bekerja dengan tim ini sangat transformatif untuk bisnis kami. Keahlian dan dedikasi mereka membantu kami mencapai hasil melebihi ekspektasi.",
      author: "Sarah Mitchell",
      role: "CEO, InnovateTech",
      avatar: "👩‍💼"
    },
    {
      content: "Tingkat profesionalisme dan keunggulan teknis sangat luar biasa. Mereka memberikan solusi yang sempurna selaras dengan visi dan melampaui tujuan kami.",
      author: "James Rodriguez",
      role: "CTO, Digital Solutions Inc",
      avatar: "👨‍💻"
    },
    {
      content: "Dari konsep hingga deployment, pengalamannya sangat mulus. Pendekatan inovatif dan perhatian terhadap detail membuat perbedaan besar dalam kesuksesan proyek kami.",
      author: "Emily Chen",
      role: "Product Director, FutureCorp",
      avatar: "👩"
    }
  ];

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <h2 className="section-title animate-fade">Dipercaya oleh Pemimpin Industri</h2>
        <p className="section-subtitle animate-fade" style={{ animationDelay: "0.2s" }}>
          Lihat apa kata klien kami tentang bekerja dengan kami
        </p>
        
        <div className="testimonial-slider">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`testimonial-card animate-fade ${activeIndex === index ? 'active' : ''}`}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="quote-icon">"</div>
              <p className="testimonial-content">{testimonial.content}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{testimonial.avatar}</div>
                <div className="testimonial-author-info">
                  <h4>{testimonial.author}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${activeIndex === index ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Lihat testimoni ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
