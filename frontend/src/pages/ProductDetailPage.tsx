import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, type Product, type SKU } from '../services/api';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiCheck, FiX, FiStar, FiChevronRight } from 'react-icons/fi';
import { BsLightning } from 'react-icons/bs';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getBySlug(slug!);
        setProduct(data);
        // Initialize with first available variant options
        if (data.variantOptions && data.variantOptions.length > 0) {
          const initialVariants: { [key: string]: string } = {};
          data.variantOptions.forEach(variant => {
            initialVariants[variant.name] = variant.values[0];
          });
          setSelectedVariants(initialVariants);
          // Find matching SKU
          findMatchingSKU(data, initialVariants);
        } else if (data.skus && data.skus.length > 0) {
          // If no variants, use first SKU
          setSelectedSKU(data.skus[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const findMatchingSKU = (prod: Product, variants: { [key: string]: string }) => {
    if (!prod.skus || prod.skus.length === 0) {
      setSelectedSKU(null);
      return;
    }

    // Find SKU that matches all selected variants
    const matchingSKU = prod.skus.find(sku => {
      if (!sku.isActive) return false;
      
      return Object.entries(variants).every(([key, value]) => {
        return sku.variants[key] === value;
      });
    });

    setSelectedSKU(matchingSKU || null);
  };

  const handleVariantChange = (variantName: string, option: string) => {
    const newVariants = {
      ...selectedVariants,
      [variantName]: option
    };
    setSelectedVariants(newVariants);
    
    if (product) {
      findMatchingSKU(product, newVariants);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;
    let price: number;
    let stock: number;
    let sku: string;
    let selectedVariantsToSend: { [key: string]: string } | undefined;
    let image = product.images[0]?.url || '📦';

    if (selectedSKU) {
      price = selectedSKU.price;
      stock = selectedSKU.stock;
      sku = selectedSKU.sku;
      selectedVariantsToSend = selectedVariants;
    } else if (Array.isArray(product.skus) && product.skus.length === 0) {
      // Produk seed tanpa SKU/variant
      price = typeof product.price === 'number' ? product.price : (product.priceRange?.min ?? 0);
      stock = typeof product.stock === 'number' ? product.stock : 1; // default 1 jika tidak ada stock
      sku = product._id || product.name || 'SINGLE';
      selectedVariantsToSend = undefined;
    } else {
      // Fallback lama
      price = product.priceRange?.min ?? product.price ?? 0;
      stock = typeof product.stock === 'number' ? product.stock : 0;
      sku = product._id || product.name || 'SINGLE';
      selectedVariantsToSend = undefined;
    }

    if (stock <= 0 || price <= 0) {
      alert('Produk tidak tersedia');
      return;
    }

    addToCart({
      _id: product._id,
      slug: product.slug,
      name: product.name,
      price,
      image,
      category: product.category?.name || '',
      description: typeof product.description === 'object' ? product.description.short : (product.description || ''),
      stock,
      selectedVariants: selectedVariantsToSend,
      sku,
    });
  };

  if (loading) {
    return (
      <div className="product-loading">
        <p>Memuat produk...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Produk tidak ditemukan</h2>
        <button className="btn" onClick={() => navigate('/')}>
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Logic harga dan stok fallback untuk produk tanpa variant
  const hasSKU = Array.isArray(product.skus) && product.skus.length > 0;
  let currentPrice: number;
  let currentStock: number;
  if (selectedSKU) {
    currentPrice = selectedSKU.price;
    currentStock = selectedSKU.stock;
  } else if (Array.isArray(product.skus) && product.skus.length === 0) {
    currentPrice = typeof product.price === 'number' ? product.price : (product.priceRange?.min ?? 0);
    currentStock = typeof product.stock === 'number' ? product.stock : 1;
  } else {
    currentPrice = product?.priceRange?.min ?? product?.price ?? 0;
    currentStock = typeof product.stock === 'number' ? product.stock : 0;
  }
  const isAvailable = (selectedSKU && selectedSKU.isActive && currentStock > 0) || (!hasSKU && currentStock > 0);

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Beranda
          </button>
          <FiChevronRight size={14} className="breadcrumb-separator" />
          {product?.category?.name ? (
            <button onClick={() => navigate('/')} className="breadcrumb-link">
              {product.category.name}
            </button>
          ) : null}
          {product?.category?.name && <FiChevronRight size={14} className="breadcrumb-separator" />}
          <span className="breadcrumb-current">{product?.name || 'Produk'}</span>
        </div>

        {/* Product Detail */}
        <div className="product-detail-container">
          <div className="product-image-section">
            <div className="main-image">
              <img 
                src={product?.images?.[selectedImageIndex]?.url || 'https://via.placeholder.com/500'} 
                alt={product?.images?.[selectedImageIndex]?.alt || product?.name || 'Produk'}
              />
            </div>
            <div className="image-thumbnails">
              {product?.images?.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={img.url} alt={img.alt} />
                </div>
              ))}
            </div>
          </div>

          <div className="product-info-section">
            {product?.category?.name && (
              <span className="product-category-badge">{product.category.name}</span>
            )}
            <h1 className="product-title">{product?.name || 'Produk'}</h1>
            <p className="product-brand">Brand: {product?.brand || '-'}</p>
            
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    fill={i < Math.floor(product?.ratings?.average || 0) ? "#FFB800" : "none"} 
                    color="#FFB800" 
                    size={16}
                  />
                ))}
              </div>
              <span className="rating-text">
                ({product?.ratings?.average || 0} dari {product?.ratings?.count || 0} ulasan)
              </span>
            </div>

            <div className="product-price-section">
              <span className="product-price">{formatPrice(currentPrice)}</span>
              {product?.priceRange && product.priceRange.min !== product.priceRange.max && !selectedSKU && (
                <span className="price-range-hint">
                  - {formatPrice(product.priceRange.max)}
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {product?.variantOptions && product.variantOptions.length > 0 && (
              <div className="product-variants">
                {product.variantOptions.map((variant) => (
                  <div key={variant.name} className="variant-group">
                    <label className="variant-label">
                      {variant.name}: <span className="variant-selected">{selectedVariants[variant.name]}</span>
                    </label>
                    <div className="variant-options">
                      {variant.values.map((option) => {
                        // Check if this variant combination exists in SKUs
                        const testVariants = { ...selectedVariants, [variant.name]: option };
                        const hasMatchingSKU = product?.skus ? product.skus.some(sku => 
                          sku.isActive && 
                          Object.entries(testVariants).every(([k, v]) => sku.variants[k] === v)
                        ) : false;
                        
                        return (
                          <button
                            key={option}
                            className={`variant-option ${selectedVariants[variant.name] === option ? 'active' : ''} ${!hasMatchingSKU ? 'disabled' : ''}`}
                            onClick={() => handleVariantChange(variant.name, option)}
                            disabled={!hasMatchingSKU}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="product-stock">
              {isAvailable ? (
                <span className="in-stock">
                  <FiCheck size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Stok tersedia ({currentStock} unit)
                </span>
              ) : (
                <span className="out-of-stock">
                  <FiX size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Stok habis
                </span>
              )}
            </div>

            <div className="product-actions">
              <button
                className="btn btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={!isAvailable}
              >
                <FiShoppingCart size={18} style={{ marginRight: '6px' }} />
                Tambah ke Keranjang
              </button>
              <button className="btn btn-buy-now" disabled={!isAvailable}>
                <BsLightning size={18} style={{ marginRight: '6px' }} />
                Beli Sekarang
              </button>
            </div>

            <div className="product-features">
              <h3>Keunggulan Produk</h3>
              <ul>
                <li><FiCheck size={16} color="#00A550" style={{ marginRight: '6px' }} />Garansi resmi 1 tahun</li>
                <li><FiCheck size={16} color="#00A550" style={{ marginRight: '6px' }} />Gratis ongkir untuk pembelian di atas 1 juta</li>
                <li><FiCheck size={16} color="#00A550" style={{ marginRight: '6px' }} />Bisa COD (Cash on Delivery)</li>
                <li><FiCheck size={16} color="#00A550" style={{ marginRight: '6px' }} />Produk original 100%</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product && product.description && (
          <div className="product-description-section">
            <h2>Deskripsi Produk</h2>
            <div className="description-content">
              <p>{product.description.long || product.description.short}</p>
              <h3>Spesifikasi</h3>
              <ul>
                <li>Brand: {product.brand || '-'}</li>
                {product.category?.name && (
                  <li>
                    Kategori: {product.category.name}
                    {product.category?.subcategory?.name ? ` / ${product.category.subcategory.name}` : ''}
                  </li>
                )}
                <li>Berat: {product.physical?.weight || '-'} {product.physical?.weightUnit || ''}</li>
                <li>Dimensi: {product.physical?.dimensions ? `${product.physical.dimensions.length} x ${product.physical.dimensions.width} x ${product.physical.dimensions.height} ${product.physical.dimensions.unit}` : '-'}</li>
                <li>Kondisi: Baru</li>
                <li>Garansi: 1 tahun</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
