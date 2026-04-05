import { useNavigate } from 'react-router-dom';
import type { Product } from '../services/api';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: number, currency?: string) => {
    return (price !== undefined && currency)
      ? new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
        }).format(price)
      : 'N/A';
  };

  const handleClick = () => {
    navigate(`/product/${product._id}`);
  };


  // Fix: handle stock for products without variants (skus)
  const getTotalStock = () => {
    if (product.skus && product.skus.length > 0) {
      return product.skus.reduce((sum, sku) => sum + sku.stock, 0);
    }
    return typeof product.stock === 'number' ? product.stock : 0;
  };

  const getAvailableSKUs = () => {
    if (product.skus && product.skus.length > 0) {
      return product.skus.filter(sku => sku.isActive && sku.stock > 0).length;
    }
    // If no skus, consider available if stock > 0
    return (typeof product.stock === 'number' && product.stock > 0) ? 1 : 0;
  };

  const totalStock = getTotalStock();
  const availableSKUs = getAvailableSKUs();
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const isSoldOut = totalStock === 0 || availableSKUs === 0;

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-image-wrapper">
        {primaryImage?.url ? (
          <img 
            src={primaryImage.url}
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
      {isSoldOut && (
        <span className="sold-badge">SOLD OUT</span>
      )}
    </div>
  );
};

export default ProductCard;
