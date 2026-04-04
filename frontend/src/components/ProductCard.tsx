import { useNavigate } from 'react-router-dom';
import type { Product } from '../services/api';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
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
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const isSoldOut = totalStock === 0 || availableSKUs === 0;

  return (
    <div className="product-card" onClick={handleClick}>
      <div 
        className="product-image"
        style={{
          backgroundImage: `url(${primaryImage?.url || 'https://via.placeholder.com/300'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        />
      <div className="product-info">
        <div className='product-name-wrapper'>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">
            {formatPrice(product.priceRange.min)}
          </p>
        </div>
        {isSoldOut && (
          <span className="sold-badge">SOLD OUT</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
