import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Hero / Header Section */}
        <div className="contact-header">
          <h1>Hubungi Kami</h1>
          <p className="contact-subtitle">
            Jika Anda memiliki pertanyaan mengenai produk, pesanan, atau kerja sama, jangan ragu untuk menghubungi kami melalui informasi kontak di bawah ini.
          </p>
        </div>

        {/* About Store Section */}
        <div className="about-store">
          <h2>Tentang Toko Kami</h2>
          <div className="about-content">
            <p>
              Kami adalah toko yang berfokus pada produk fashion dan streetwear pilihan. Setiap produk dipilih dengan standar kualitas tinggi untuk memastikan pelanggan mendapatkan produk terbaik.
            </p>
            <p>
              Kami percaya bahwa fashion bukan hanya tentang pakaian, tetapi juga tentang ekspresi diri dan gaya hidup. Melalui website ini, kami berkomitmen untuk memberikan pengalaman berbelanja yang terbaik dengan koleksi produk yang terseleksi dan layanan pelanggan yang responsif.
            </p>
            <p>
              Kepuasan pelanggan adalah prioritas utama kami. Terima kasih telah menjadi bagian dari keluarga besar toko kami!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
