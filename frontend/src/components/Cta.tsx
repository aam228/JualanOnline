
import React from 'react';
import './Cta.css';

const Cta: React.FC = () => {
  return (
    <section className="cta">
      <div className="container">
        <h2 className="animate-fade">Ready to Reinvent the Way You Work?</h2>
        <p className="animate-fade" style={{ animationDelay: "0.2s" }}>
          Join thousands of developers and designers already building faster with our platform.
        </p>
        <div className="cta-buttons animate-fade" style={{ animationDelay: "0.4s" }}>
          <a href="#" className="btn">Try Free</a>
          <a href="#" className="btn btn-outline">See Pricing</a>
        </div>
      </div>
    </section>
  );
};

export default Cta;
