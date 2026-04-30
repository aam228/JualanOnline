import type { Product } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

const ProductDetail = ({ product, onClose }: ProductDetailProps) => {
  const { addToCart } = useCart();
  const categoryLabel = typeof product.category === 'string'
    ? product.category
    : product.category?.name || '';
  const primaryPrice = product.priceRange?.min ?? (typeof product.price === 'number' ? product.price : Number(product.price) || 0);
  const shortDescription = typeof product.description === 'string'
    ? product.description
    : product.description?.short || '';
  const longDescription = typeof product.description === 'string'
    ? product.description
    : product.description?.long || '';

  const formatPrice = (price: number) => {
    return (price !== undefined && product.currency)
      ? new Intl.NumberFormat(product.currency === 'IDR' ? 'id-ID' : 'en-US', {
          style: 'currency',
          currency: product.currency,
          minimumFractionDigits: 0,
        }).format(price)
      : 'N/A';
  };

  const handleAddToCart = () => {
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    let skuToUse = product.skus.find(sku => sku.isActive && sku.stock > 0);
    let stockToUse = 0;
    let priceToUse = 0;
    let skuCode = '';

    const toPositiveNumber = (value: unknown): number | null => {
      const numeric = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
    };

    const resolvePositivePrice = () => {
      const candidates = [
        skuToUse?.price,
        product.price,
        product.priceRange?.min,
        ...(Array.isArray(product.skus) ? product.skus.map((sku) => sku.price) : []),
      ];

      for (const candidate of candidates) {
        const numericCandidate = toPositiveNumber(candidate);
        if (numericCandidate) {
          return numericCandidate;
        }
      }

      return 0;
    };

    if (skuToUse) {
      stockToUse = skuToUse.stock;
      priceToUse = skuToUse.price > 0 ? skuToUse.price : resolvePositivePrice();
      skuCode = skuToUse.sku;
    } else if (typeof product.stock === 'number' && product.stock > 0) {
      stockToUse = product.stock;
      priceToUse = resolvePositivePrice();
      skuCode = product._id || product.name || 'SINGLE';
    } else {
      alert('Product is unavailable');
      return;
    }

    if (priceToUse <= 0) {
      alert('The product price is invalid');
      return;
    }

    addToCart({
      _id: product._id,
      slug: product.slug || product._id || product.name.toLowerCase().replace(/\s+/g, '-'),
      name: product.name,
      price: priceToUse,
      image: primaryImage?.url || '',
        category: categoryLabel,
        description: shortDescription,
      stock: stockToUse,
      currency: product.currency,
      sku: skuCode,
    });
    onClose();
  };

  const getTotalStock = () => {
    if (Array.isArray(product.skus) && product.skus.length > 0) {
      return product.skus.reduce((sum, sku) => sum + sku.stock, 0);
    }
    return typeof product.stock === 'number' ? product.stock : 1;
  };

  const totalStock = getTotalStock();
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="detail-container">
          <div className="detail-image">
            <img src={primaryImage?.url} alt={primaryImage?.alt || product.name} />
          </div>
          
          <div className="detail-info">
            <span className="detail-category">{categoryLabel}</span>
            <h2 className="detail-name">{product.name}</h2>
            <p className="detail-price">{formatPrice(primaryPrice)}</p>
            
            <div className="detail-stock">
              <span className={totalStock > 0 ? 'in-stock' : 'out-stock'}>
                {totalStock > 0 ? `✓ In Stock: ${totalStock}` : '✗ Out of Stock'}
              </span>
            </div>
            
            <p className="detail-description">{longDescription}</p>
            
            <button 
              className="btn btn-add-cart" 
              onClick={handleAddToCart}
              disabled={totalStock === 0}
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
