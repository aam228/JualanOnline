import type { Product } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

const ProductDetail = ({ product, onClose }: ProductDetailProps) => {
  const { addToCart } = useCart();

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

    if (skuToUse) {
      stockToUse = skuToUse.stock;
      priceToUse = skuToUse.price;
      skuCode = skuToUse.sku;
    } else if (typeof product.stock === 'number' && product.stock > 0) {
      stockToUse = product.stock;
      priceToUse = product.priceRange?.min || product.price || 0;
      skuCode = product._id || product.name || 'SINGLE';
    } else {
      alert('Produk tidak tersedia');
      return;
    }

    addToCart({
      _id: product._id,
      slug: product.slug,
      name: product.name,
      price: priceToUse,
      image: primaryImage?.url || '',
      category: product.category.name,
      description: product.description.short,
      stock: stockToUse,
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
            <span className="detail-category">{product.category.name}</span>
            <h2 className="detail-name">{product.name}</h2>
            <p className="detail-price">{formatPrice(product.priceRange.min)}</p>
            
            <div className="detail-stock">
              <span className={totalStock > 0 ? 'in-stock' : 'out-stock'}>
                {totalStock > 0 ? `✓ Stok: ${totalStock}` : '✗ Stok Habis'}
              </span>
            </div>
            
            <p className="detail-description">{product.description.long}</p>
            
            <button 
              className="btn btn-add-cart" 
              onClick={handleAddToCart}
              disabled={totalStock === 0}
            >
              🛒 Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
