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
      alert('Product not available');
      return;
    }

    addToCart({
      _id: product._id,
      slug: product.slug || product._id || product.name.toLowerCase().replace(/\s+/g, '-'),
      name: product.name,
      price,
      image,
      category: product.category?.name || '',
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

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Home
          </button>
          <FiChevronRight size={14} className="breadcrumb-separator" />
          {product?.category?.name ? (
            <button onClick={() => navigate('/')} className="breadcrumb-link">
              {product.category.name}
            </button>
          ) : null}
          {product?.category?.name && <FiChevronRight size={14} className="breadcrumb-separator" />}
          <span className="breadcrumb-current">{product?.name || 'Product'}</span>
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
            <h1 className="product-title">{product?.name || 'Product'}</h1>
            <p className="product-brand">{product?.brand || '-'}</p>

            <div className="product-price-section">
              <span className="product-price">{formatPrice(currentPrice)}</span>
              {product?.priceRange && product.priceRange.min !== product.priceRange.max && !selectedSKU && (
                <span className="price-range-hint">
                  - {formatPrice(product.priceRange.max)}
                </span>
              )}
            </div>

            <p className="product-brand .include-tax">Tax Include</p>

            {/* Dropdown Size (selalu tampil, jika tidak ada data size, tampilkan satu option placeholder) */}
            <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', }}>
              <label htmlFor="size-select" style={{ fontWeight: 600, marginRight: 8 }}>Size</label>
              <select
                id="size-select"
                value={selectedVariants['Size'] || ''}
                onChange={e => handleVariantChange('Size', e.target.value)}
                style={{ padding: '6px 12px', border: '1px solid #E5E7EB', fontSize: 15, width: 'fit-content', marginTop: "2px" }}
              >
                {(() => {
                  if (
                    Array.isArray(product?.variantOptions) &&
                    product.variantOptions.length > 0 &&
                    product.variantOptions.some(v => v.name.toLowerCase() === 'size')
                  ) {
                    const sizeVariant = product.variantOptions.find(v => v.name.toLowerCase() === 'size');
                    if (sizeVariant && Array.isArray(sizeVariant.values) && sizeVariant.values.length > 0) {
                      return sizeVariant.values.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ));
                    } else {
                      return <option value="">Size</option>;
                    }
                  } else {
                    return <option value="">Size</option>;
                  }
                })()}
              </select>
            </div>

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
                        category: product.category?.name || product.category || '',
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
