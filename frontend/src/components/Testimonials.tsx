import React, { useState } from 'react';
import './Testimonials.css';

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      content: "Working with this team has been transformative for our business. Their expertise and dedication helped us achieve results beyond expectations.",
      author: "Sarah Mitchell",
      role: "CEO, InnovateTech",
      avatar: "👩‍💼"
    },
    {
      content: "Their level of professionalism and technical excellence is outstanding. They delivered a solution that perfectly matched our vision and exceeded our goals.",
      author: "James Rodriguez",
      role: "CTO, Digital Solutions Inc",
      avatar: "👨‍💻"
    },
    {
      content: "From concept to deployment, the experience was seamless. Their innovative approach and attention to detail made a major difference in our project's success.",
      author: "Emily Chen",
      role: "Product Director, FutureCorp",
      avatar: "👩"
    }
  ];

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <h2 className="section-title animate-fade">Trusted by Industry Leaders</h2>
        <p className="section-subtitle animate-fade" style={{ animationDelay: "0.2s" }}>
          See what our clients have to say about working with us
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
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
