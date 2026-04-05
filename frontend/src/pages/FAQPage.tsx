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
    // Pesanan
    {
      id: 'order-1',
      category: 'pesanan',
      question: 'Bagaimana cara melakukan pemesanan?',
      answer: 'Pilih produk yang Anda inginkan, tambahkan ke keranjang, lalu lanjutkan ke halaman checkout untuk menyelesaikan pembayaran.',
    },
    {
      id: 'order-2',
      category: 'pesanan',
      question: 'Bagaimana cara melihat status pesanan saya?',
      answer: 'Anda dapat melihat status pesanan melalui halaman "Riwayat Pesanan" setelah login ke akun Anda.',
    },
    // Pembayaran
    {
      id: 'payment-1',
      category: 'pembayaran',
      question: 'Metode pembayaran apa saja yang tersedia?',
      answer: 'Kami menerima pembayaran menggunakan kartu kredit, kartu debit, dan metode pembayaran lain yang didukung oleh sistem pembayaran kami.',
    },
    {
      id: 'payment-2',
      category: 'pembayaran',
      question: 'Mengapa pembayaran saya gagal?',
      answer: 'Pembayaran dapat gagal karena saldo tidak cukup, kartu tidak valid, atau sistem bank menolak transaksi. Silakan coba kembali atau gunakan metode pembayaran lain.',
    },
    // Pengiriman
    {
      id: 'shipping-1',
      category: 'pengiriman',
      question: 'Berapa lama waktu pengiriman?',
      answer: 'Waktu pengiriman biasanya memakan waktu beberapa hari kerja tergantung lokasi pengiriman dan layanan kurir yang digunakan.',
    },
    {
      id: 'shipping-2',
      category: 'pengiriman',
      question: 'Bagaimana cara melacak pesanan saya?',
      answer: 'Setelah pesanan dikirim, Anda akan menerima informasi pelacakan yang dapat digunakan untuk memantau status pengiriman.',
    },
    // Produk
    {
      id: 'product-1',
      category: 'produk',
      question: 'Apakah produk yang dijual original?',
      answer: 'Semua produk yang tersedia di website kami dijamin original dan telah melalui proses kurasi sebelum dijual.',
    },
    {
      id: 'product-2',
      category: 'produk',
      question: 'Apakah produk dapat ditukar atau dikembalikan?',
      answer: 'Produk dapat ditukar atau dikembalikan sesuai dengan kebijakan pengembalian yang berlaku di website ini.',
    },
    // Akun
    {
      id: 'account-1',
      category: 'akun',
      question: 'Bagaimana cara membuat akun?',
      answer: 'Klik tombol daftar pada halaman login dan isi informasi yang diminta untuk membuat akun baru.',
    },
    {
      id: 'account-2',
      category: 'akun',
      question: 'Saya lupa password, bagaimana cara meresetnya?',
      answer: 'Gunakan fitur lupa password di halaman login untuk menerima instruksi reset password melalui email.',
    },
  ];

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'pesanan', label: 'Pesanan' },
    { id: 'pembayaran', label: 'Pembayaran' },
    { id: 'pengiriman', label: 'Pengiriman' },
    { id: 'produk', label: 'Produk' },
    { id: 'akun', label: 'Akun' },
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
          <h2>Pertanyaan Umum</h2>
          <p className="faq-subtitle">
            Temukan jawaban untuk pertanyaan yang paling sering diajukan mengenai pesanan, pembayaran, akun, dan pengiriman.
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
            <h3>Masih punya pertanyaan?</h3>
            <p>
              Jika Anda tidak menemukan jawaban yang Anda cari, silakan hubungi tim support kami.
            </p>
            <button
              className="btn-contact"
              onClick={() => navigate('/')}
            >
              Hubungi Kami
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
