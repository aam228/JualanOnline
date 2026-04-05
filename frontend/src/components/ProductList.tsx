import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, type Product } from '../services/api';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productAPI.getAll();
      const publishedProducts = data.filter(p => p.isPublished);
      setProducts(publishedProducts);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Gagal memuat produk. Pastikan backend server berjalan.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    return (price !== undefined && currency)
      ? new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
        }).format(price)
      : 'N/A';
  };

  // Fix: handle stock for products without variants (skus)
  const getTotalStock = (product: Product) => {
    if (product.skus && product.skus.length > 0) {
      return product.skus.reduce((sum, sku) => sum + sku.stock, 0);
    }
    return typeof product.stock === 'number' ? product.stock : 0;
  };

  const getAvailableSKUs = (product: Product) => {
    if (product.skus && product.skus.length > 0) {
      return product.skus.filter(sku => sku.isActive && sku.stock > 0).length;
    }
    // If no skus, consider available if stock > 0
    return (typeof product.stock === 'number' && product.stock > 0) ? 1 : 0;
  };

  if (loading) {
    return (
      <section className="product-list-section">
        <div className="loading">Memuat produk...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="product-list-section">
        <div className="error-message">
          {error}
          <br />
          <button className="btn" onClick={fetchProducts} style={{ marginTop: '1rem' }}>
            Coba Lagi
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="product-list-section">
      <div className="products-grid">
        {products.length > 0 ? (
          products.map(product => {
            const totalStock = getTotalStock(product);
            const availableSKUs = getAvailableSKUs(product);
            const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

            return (
              <div
                key={product._id}
                className="product-card"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="product-image-wrapper">
                  {primaryImage?.url ? (
                    <img 
                      src={primaryImage.url || undefined} 
                      alt={primaryImage.alt || product.name}
                      className="product-image"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  ) : null}
                </div>
                <div className="product-info">
                  <h3 className="product-card-name">{product.name}</h3>
                  <p className="product-card-price">
                    {product.price !== undefined && product.price !== null && !isNaN(Number(product.price)) && product.currency ? (
                      formatPrice(Number(product.price), product.currency)
                    ) : product.priceRange && typeof product.priceRange.min === 'number' ? (
                      formatPrice(product.priceRange.min, product.priceRange.currency)
                    ) : 'N/A'}
                  </p>
                </div>
                  {(totalStock === 0 || availableSKUs === 0) && (
                    <span className="sold-badge">SOLD OUT</span>
                  )}
              </div>
            );
          })
        ) : (
          <div className="no-products">
            <p>Tidak ada produk yang ditemukan</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;
