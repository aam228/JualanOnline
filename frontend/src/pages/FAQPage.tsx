import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FAQPage.css';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQPage = () => {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqData: FAQItem[] = [
    // Orders
    {
      id: 'order-1',
      category: 'orders',
      question: 'How do I place an order?',
      answer: 'Choose the product you want, add it to your cart, then continue to checkout to complete your payment.',
    },
    {
      id: 'order-2',
      category: 'orders',
      question: 'How can I check my order status?',
      answer: 'You can view your order status on the Order History page after logging in to your account.',
    },
    // Payment
    {
      id: 'payment-1',
      category: 'payment',
      question: 'Which payment methods are available?',
      answer: 'We accept credit cards, debit cards, and other payment methods supported by our payment system.',
    },
    {
      id: 'payment-2',
      category: 'payment',
      question: 'Why did my payment fail?',
      answer: 'A payment can fail because of insufficient funds, an invalid card, or a bank rejection. Please try again or use another payment method.',
    },
    // Shipping
    {
      id: 'shipping-1',
      category: 'shipping',
      question: 'How long does shipping take?',
      answer: 'Shipping usually takes a few business days depending on the delivery location and courier service used.',
    },
    {
      id: 'shipping-2',
      category: 'shipping',
      question: 'How can I track my order?',
      answer: 'After your order ships, you will receive tracking information that you can use to monitor delivery status.',
    },
    // Products
    {
      id: 'product-1',
      category: 'products',
      question: 'Are the products authentic?',
      answer: 'All products available on our website are authentic and have been curated before being sold.',
    },
    {
      id: 'product-2',
      category: 'products',
      question: 'Can products be exchanged or returned?',
      answer: 'Products can be exchanged or returned according to the return policy in effect on this website.',
    },
    // Account
    {
      id: 'account-1',
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click the register button on the login page and fill in the required information to create a new account.',
    },
    {
      id: 'account-2',
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Use the forgot password feature on the login page to receive password reset instructions by email.',
    },
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'orders', label: 'Orders' },
    { id: 'payment', label: 'Payment' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'products', label: 'Products' },
    { id: 'account', label: 'Account' },
  ];

  const filteredFAQ =
    selectedCategory === 'all'
      ? faqData
      : faqData.filter((item) => item.category === selectedCategory);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="faq-page">
      <div className="faq-container">
        {/* Header Section */}
        <div className="faq-header">
          <h1>FAQ</h1>
          <h2>Frequently Asked Questions</h2>
          <p className="faq-subtitle">
            Find answers to the most frequently asked questions about orders, payment, account access, and shipping.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="faq-categories">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="faq-list">
          {filteredFAQ.map((faq) => (
            <div key={faq.id} className="faq-item">
              <button
                className={`faq-question ${openId === faq.id ? 'open' : ''}`}
                onClick={() => toggleAccordion(faq.id)}
              >
                <span className="question-text">{faq.question}</span>
                <span className="toggle-icon">
                  {openId === faq.id ? '−' : '+'}
                </span>
              </button>
              {openId === faq.id && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support Section */}
        <div className="faq-contact">
          <div className="contact-content">
            <h3>Still have questions?</h3>
            <p>
              If you cannot find the answer you need, please contact our support team.
            </p>
            <button
              className="btn-contact"
              onClick={() => navigate('/')}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
