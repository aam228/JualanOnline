import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CheckoutPage.css';

interface ShippingData {
  name: string;
  email: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  cityId: string;
  postalCode: string;
}

interface ShippingOption {
  courier: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Shipping Data
  const [shippingData, setShippingData] = useState<ShippingData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    province: '',
    city: '',
    cityId: '',
    postalCode: ''
  });

  // Step 2: Shipping Options
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

  // Cities data
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
    }
  }, [cart, navigate]);

  useEffect(() => {
    // Fetch cities for autocomplete
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/shipping/cities`);
      const data = await response.json();
      if (data.data) {
        setCities(data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate total weight (in grams)
      const totalWeight = cart.reduce((sum, item) => {
        // Assume each product weighs 500g, adjust based on your products
        return sum + (500 * item.quantity);
      }, 0);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/shipping/cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: shippingData.cityId,
          weight: totalWeight,
          courier: 'jne:tiki:pos'
        })
      });

      const data = await response.json();
      
      if (data.data?.results) {
        const options: ShippingOption[] = [];
        data.data.results.forEach((courier: any) => {
          courier.costs.forEach((cost: any) => {
            options.push({
              courier: courier.code.toUpperCase(),
              service: cost.service,
              description: cost.description,
              cost: cost.cost[0].value,
              etd: cost.cost[0].etd
            });
          });
        });
        setShippingOptions(options);
        setStep(2);
      }
    } catch (error) {
      console.error('Error fetching shipping cost:', error);
      alert('Gagal mengambil data ongkir. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSelect = (option: ShippingOption) => {
    setSelectedShipping(option);
    setStep(3);
  };

  const handlePayment = () => {
    // Just show summary, no payment yet
    alert(`Pesanan berhasil dibuat!\n\nTotal: ${formatPrice(total)}\n\nData pesanan:\n- Nama: ${shippingData.name}\n- Email: ${shippingData.email}\n- Alamat: ${shippingData.address}, ${shippingData.city}\n- Kurir: ${selectedShipping?.courier} ${selectedShipping?.service}\n\nSilakan lakukan pembayaran.`);
    clearCart();
    navigate('/');
  };

  const subtotal = getTotalPrice();
  const shippingCost = selectedShipping?.cost || 0;
  const total = subtotal + shippingCost;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        
        {/* Progress Steps */}
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Alamat Pengiriman</div>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Pilih Kurir</div>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Pembayaran</div>
          </div>
        </div>

        <div className="checkout-content">
          {/* Step 1: Shipping Form */}
          {step === 1 && (
            <div className="checkout-step">
              <h2>Alamat Pengiriman</h2>
              <form onSubmit={handleShippingSubmit} className="shipping-form">
                <div className="form-group">
                  <label>Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={shippingData.name}
                    onChange={(e) => setShippingData({...shippingData, name: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      value={shippingData.email}
                      onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>No. HP *</label>
                    <input
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Alamat Lengkap *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                    value={shippingData.address}
                    onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Kota/Kabupaten *</label>
                    <input
                      type="text"
                      required
                      list="cities-list"
                      placeholder="Ketik nama kota..."
                      value={shippingData.city}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setShippingData({...shippingData, city: inputValue});
                        
                        // Find matching city from list
                        const matchedCity = cities.find(c => 
                          `${c.type} ${c.city_name}`.toLowerCase() === inputValue.toLowerCase()
                        );
                        
                        if (matchedCity) {
                          setShippingData({
                            ...shippingData,
                            cityId: matchedCity.city_id,
                            city: `${matchedCity.type} ${matchedCity.city_name}`,
                            province: matchedCity.province
                          });
                        }
                      }}
                    />
                    <datalist id="cities-list">
                      {cities.map((city) => (
                        <option 
                          key={city.city_id} 
                          value={`${city.type} ${city.city_name}`}
                        >
                          {city.province}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label>Kode Pos *</label>
                    <input
                      type="text"
                      required
                      placeholder="12345"
                      value={shippingData.postalCode}
                      onChange={(e) => setShippingData({...shippingData, postalCode: e.target.value})}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Mengecek Ongkir...' : 'Cek Ongkir'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Shipping Options */}
          {step === 2 && (
            <div className="checkout-step">
              <h2>Pilih Kurir Pengiriman</h2>
              <div className="shipping-options">
                {shippingOptions.map((option, index) => (
                  <div
                    key={index}
                    className="shipping-option"
                    onClick={() => handleShippingSelect(option)}
                  >
                    <div className="option-info">
                      <div className="option-courier">{option.courier} - {option.service}</div>
                      <div className="option-desc">{option.description}</div>
                      <div className="option-etd">Estimasi: {option.etd} hari</div>
                    </div>
                    <div className="option-price">{formatPrice(option.cost)}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Kembali
              </button>
            </div>
          )}

          {/* Step 3: Payment Summary */}
          {step === 3 && (
            <div className="checkout-step">
              <h2>Ringkasan Pesanan</h2>
              
              <div className="order-summary">
                <div className="summary-section">
                  <h3>Produk</h3>
                  {cart.map((item) => (
                    <div key={`${item._id}-${item.sku}`} className="summary-item">
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-qty">x{item.quantity}</div>
                      </div>
                      <div className="item-price">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>

                <div className="summary-section">
                  <h3>Pengiriman</h3>
                  <div className="summary-item">
                    <div className="item-info">
                      <div className="item-name">{shippingData.name}</div>
                      <div className="item-address">{shippingData.address}, {shippingData.city}</div>
                      <div className="item-courier">
                        {selectedShipping?.courier} {selectedShipping?.service} ({selectedShipping?.etd} hari)
                      </div>
                    </div>
                    <div className="item-price">{formatPrice(shippingCost)}</div>
                  </div>
                </div>

                <div className="summary-total">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="total-row">
                    <span>Ongkir</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="total-row total-final">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="payment-actions">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>
                  Kembali
                </button>
                <button className="btn btn-primary" onClick={handlePayment}>
                  Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
