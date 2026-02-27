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
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    const firstActiveSKU = product.skus.find(sku => sku.isActive && sku.stock > 0);
    
    if (!firstActiveSKU) {
      alert('Produk tidak tersedia');
      return;
    }

    addToCart({
      _id: product._id,
      name: product.name,
      price: firstActiveSKU.price,
      image: primaryImage?.url || '',
      category: product.category.name,
      description: product.description.short,
      stock: firstActiveSKU.stock,
      sku: firstActiveSKU.sku,
    });
    onClose();
  };

  const getTotalStock = () => {
    return product.skus.reduce((sum, sku) => sum + sku.stock, 0);
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
