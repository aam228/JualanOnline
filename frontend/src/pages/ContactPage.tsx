import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Hero / Header Section */}
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p className="contact-subtitle">
            If you have questions about products, orders, or partnerships, feel free to reach out using the contact information below.
          </p>
        </div>

        {/* About Store Section */}
        <div className="about-store">
          <h2>About Our Store</h2>
          <div className="about-content">
            <p>
              We are a store focused on curated fashion and streetwear products. Every item is selected with high quality standards to ensure customers receive the best products.
            </p>
            <p>
              We believe fashion is not only about clothing, but also about self-expression and lifestyle. Through this website, we are committed to delivering the best shopping experience with a curated collection and responsive customer service.
            </p>
            <p>
              Customer satisfaction is our top priority. Thank you for being part of our store family!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
