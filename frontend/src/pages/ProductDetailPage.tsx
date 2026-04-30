import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, type Product, type SKU } from '../services/api';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiChevronRight } from 'react-icons/fi';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);

  const sizeVariant = product?.variantOptions?.find(
    (variant) => variant.name.toLowerCase() === 'size'
  );
  const hasSizeVariants = Boolean(sizeVariant && Array.isArray(sizeVariant.values) && sizeVariant.values.length > 0);
  const displaySize = selectedVariants['Size']
    || product?.size
    || product?.measurements?.Size
    || product?.measurements?.size
    || (hasSizeVariants ? sizeVariant?.values[0] : '-');
  const categoryLabel = typeof product?.category === 'string'
    ? product.category
    : product?.category?.name || '';
  const typeLabel = product?.type || '';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getById(id!);
        setProduct(data);
        
        // Initialize with first available variant options
        if (Array.isArray(data.variantOptions) && data.variantOptions.length > 0) {
          const initialVariants: { [key: string]: string } = {};
          data.variantOptions.forEach(variant => {
            if (Array.isArray(variant.values) && variant.values.length > 0) {
              initialVariants[variant.name] = variant.values[0];
            }
          });
          setSelectedVariants(initialVariants);
          // Find matching SKU
          findMatchingSKU(data, initialVariants);
        } else if (Array.isArray(data.skus) && data.skus.length > 0) {
          // If no variants, use first SKU
          setSelectedSKU(data.skus[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

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
    return (price !== undefined && product?.currency)
      ? new Intl.NumberFormat(product.currency === 'IDR' ? 'id-ID' : 'en-US', {
          style: 'currency',
          currency: product.currency,
          minimumFractionDigits: 0,
        }).format(price)
      : 'N/A';
  };

  const handleAddToCart = () => {
    if (!product) return;

    const toPositiveNumber = (value: unknown): number | null => {
      const numeric = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
    };

    const resolvePositivePrice = (): number => {
      const candidates = [
        selectedSKU?.price,
        product.price,
        product.priceRange?.min,
        ...(Array.isArray(product.skus) ? product.skus.map((skuItem) => skuItem.price) : []),
      ];

      for (const candidate of candidates) {
        const numericCandidate = toPositiveNumber(candidate);
        if (numericCandidate) {
          return numericCandidate;
        }
      }

      return 0;
    };

    let price: number;
    let stock: number;
    let sku: string;
    let selectedVariantsToSend: { [key: string]: string } | undefined;
    let image = product.images[0]?.url || '📦';

    if (selectedSKU) {
      price = selectedSKU.price > 0 ? selectedSKU.price : resolvePositivePrice();
      stock = selectedSKU.stock;
      sku = selectedSKU.sku;
      selectedVariantsToSend = selectedVariants;
    } else if (Array.isArray(product.skus) && product.skus.length === 0) {
      // Produk seed tanpa SKU/variant
      price = resolvePositivePrice();
      stock = typeof product.stock === 'number' ? product.stock : 1; // default 1 jika tidak ada stock
      sku = product._id || product.name || 'SINGLE';
      selectedVariantsToSend = undefined;
    } else {
      // Fallback lama
      price = resolvePositivePrice();
      stock = typeof product.stock === 'number' ? product.stock : 0;
      sku = product._id || product.name || 'SINGLE';
      selectedVariantsToSend = undefined;
    }

    if (stock <= 0 || price <= 0) {
      alert('Product not available');
      return;
    }

      addToCart({
      _id: product._id,
      slug: product.slug || product._id || product.name.toLowerCase().replace(/\s+/g, '-'),
      name: product.name,
      price,
      image,
      category: categoryLabel,
      description: typeof product.description === 'object' ? product.description.short : (product.description || ''),
      stock,
      currency: product.currency,
      selectedVariants: selectedVariantsToSend,
      sku,
    });
  };

  if (loading) {
    return (
      <div className="product-loading">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <button className="btn" onClick={() => navigate('/')}> 
          Back to Home
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
  const stockLabel = currentStock > 0 ? `${currentStock} pcs available` : 'Out of stock';
  const variantSizeOptions = hasSizeVariants ? sizeVariant?.values || [] : [];

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Home
          </button>
          <FiChevronRight size={14} className="breadcrumb-separator" />
          {categoryLabel ? (
            <button onClick={() => navigate('/')} className="breadcrumb-link">
              {categoryLabel}
            </button>
          ) : null}
          {categoryLabel && <FiChevronRight size={14} className="breadcrumb-separator" />}
          <span className="breadcrumb-current">{product?.name || 'Product'}</span>
        </div>

        {/* Product Detail */}
        <div className="product-detail-container">
          <div className="product-image-section">
            <div className="main-image">
              <img 
                src={product?.images?.[selectedImageIndex]?.url || 'https://via.placeholder.com/500'} 
                alt={product?.images?.[selectedImageIndex]?.alt || product?.name || 'Product'}
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
            {categoryLabel && (
              <span className="product-category-badge">{categoryLabel}</span>
            )}
            <h1 className="product-title">{product?.name || 'Product'}</h1>
            <p className="product-brand">{product?.brand || '-'}</p>
            {typeLabel && <p className="product-brand">{typeLabel}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, margin: '16px 0 18px' }}>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', background: '#FAFAFA' }}>
                <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Size</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, color: '#111827' }}>{displaySize || '-'}</div>
              </div>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', background: '#FAFAFA' }}>
                <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stock</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, color: currentStock > 0 ? '#111827' : '#B91C1C' }}>{stockLabel}</div>
              </div>
            </div>

            <div className="product-price-section">
              <span className="product-price">{formatPrice(currentPrice)}</span>
              {product?.priceRange && product.priceRange.min !== product.priceRange.max && !selectedSKU && (
                <span className="price-range-hint">
                  - {formatPrice(product.priceRange.max)}
                </span>
              )}
            </div>

            <p className="product-brand .include-tax">Tax Include</p>

            {hasSizeVariants ? (
              <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="size-select" style={{ fontWeight: 600, marginRight: 8 }}>Size</label>
                <select
                  id="size-select"
                  value={selectedVariants['Size'] || ''}
                  onChange={(e) => handleVariantChange('Size', e.target.value)}
                  style={{ padding: '6px 12px', border: '1px solid #E5E7EB', fontSize: 15, width: 'fit-content', marginTop: '2px' }}
                >
                  {variantSizeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 600 }}>Size</span>
                <span style={{ padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 999, background: '#FAFAFA', fontSize: 15 }}>
                  {displaySize || '-'}
                </span>
              </div>
            )}

            <div className="product-actions">
              <button
                className="btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={!isAvailable}
              >
                <FiShoppingCart size={18} style={{ marginRight: '6px' }} />
                Add to Cart
              </button>
              <button
                className="btn-buy-now"
                disabled={!isAvailable}
                onClick={() => {
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
                    price = typeof product.price === 'number' ? product.price : (product.priceRange?.min ?? 0);
                    stock = typeof product.stock === 'number' ? product.stock : 1;
                    sku = product._id || product.name || 'SINGLE';
                    selectedVariantsToSend = undefined;
                  } else {
                    price = product.priceRange?.min ?? product.price ?? 0;
                    stock = typeof product.stock === 'number' ? product.stock : 0;
                    sku = product._id || product.name || 'SINGLE';
                    selectedVariantsToSend = undefined;
                  }
                  if (stock <= 0 || price <= 0) {
                    alert('Product not available');
                    return;
                  }
                  // Redirect ke halaman checkout dengan data produk (tanpa masuk cart)
                  navigate('/checkout', {
                    state: {
                      product: {
                        _id: product._id,
                        slug: product.slug,
                        name: product.name,
                        price,
                        image,
                        category: categoryLabel,
                        description: typeof product.description === 'object' ? product.description.short : (product.description || ''),
                        stock,
                        currency: product.currency,
                        selectedVariants: selectedVariantsToSend,
                        sku,
                      }
                    }
                  });
                }}
              >
                Buy Now
              </button>
            </div>

            {/* Product Specifications */}
            <div className="product-spec-section">
              <ul>
                <li>SIZE: {displaySize || '-'}</li>
                <li>STOCK: {currentStock > 0 ? `${currentStock} pcs` : 'Out of stock'}</li>
                <li>CATEGORY: {categoryLabel || '-'}</li>
                <li>TYPE: {typeLabel || '-'}</li>
                <li>YEAR: {product.year || '-'}</li>
                <li>CONDITION: {product.condition || '-'}</li>
                <li>DETAILS: {typeof product.description === 'string' ? product.description : (product.description?.short || '-')}</li>
                <li>MEASUREMENTS:</li>
                {product.measurements && Object.keys(product.measurements).length > 0 ? (
                  <ul style={{ marginLeft: 16 }}>
                    {Object.entries(product.measurements).map(([key, value]) => (
                      <li key={key}>{key}: {value}</li>
                    ))}
                  </ul>
                ) : (
                  <ul style={{ marginLeft: 16 }}><li>-</li></ul>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
