
import React, { useState } from 'react';
import './Features.css';

const Features: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: '🚀',
      title: 'Fast Delivery',
      description: 'Speed up your project timeline with an efficient delivery process and proven methodology.'
    },
    {
      icon: '💡',
      title: 'Leading Innovation',
      description: 'Stay ahead with cutting-edge technology solutions tailored to your business needs.'
    },
    {
      icon: '🎯',
      title: 'Goal Driven',
      description: 'We focus on delivering measurable results aligned with your business objectives.'
    },
    {
      icon: '🤝',
      title: 'Full Support',
      description: 'Our expert team is ready to support you 24/7 at every step of the journey.'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Bank-grade security protocols to protect your data and ensure compliance.'
    },
    {
      icon: '📊',
      title: 'Analytics & Insights',
      description: 'Real-time analytics and reporting to help you make data-driven decisions with confidence.'
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title animate-fade">Why Choose Us</h2>
        <p className="section-subtitle animate-fade" style={{ animationDelay: "0.2s" }}>
          Comprehensive solutions designed to elevate your business
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
