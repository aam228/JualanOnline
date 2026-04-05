import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import './AdminDashboard.css';

interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

interface Sku {
  price: number;
  currency: string;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  price?: number;
  priceRange?: PriceRange;
  skus?: Sku[];
  condition: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/admin/products?page=${page}&limit=10`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.status === 401) {
        setError('Unauthorized. Please login again.');
        navigate('/login');
        return;
      }
      
      if (response.status === 403) {
        setError('You do not have permission to access this page.');
        navigate('/');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.data);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.status === 401 || response.status === 403) {
        setError('Unauthorized. Please login again.');
        navigate('/login');
        return;
      }
      
      if (response.ok) {
        setProducts(products.filter(p => p._id !== id));
      } else {
        setError('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">
        {/* Header */}
        <div className="admin-dashboard-header">
          <div>
            <h1 className="admin-dashboard-title">Products</h1>
            <p className="admin-dashboard-desc">Manage your vintage clothing inventory</p>
          </div>
          <Link 
            to="/admin/products/new"
            className="admin-dashboard-add-btn"
          >
            <FiPlus size={20} />
            Add Product
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : error ? (
          <div className="admin-error-message">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="admin-dashboard-table">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Brand</th>
                      <th>Price</th>
                      <th>Condition</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{product.brand || '-'}</td>
                        <td>
                          {product.priceRange ? (
                            `${product.priceRange.currency} ${product.priceRange.max.toLocaleString('id-ID')}`
                          ) : (product.price !== undefined && product.price !== null && !isNaN(Number(product.price))) ? (
                            `${(product as any).currency ? (product as any).currency : 'Rp'} ${Number(product.price).toLocaleString('id-ID')}`
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            {product.condition || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={product.isPublished ? 'admin-dashboard-status-published' : 'admin-dashboard-status-draft'}>
                            {product.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link 
                              to={`/admin/products/${product._id}`}
                              className="admin-dashboard-action-btn edit"
                            >
                              <FiEdit2 size={18} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(product._id)}
                              className="admin-dashboard-action-btn delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
