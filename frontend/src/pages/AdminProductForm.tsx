import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { FiX, FiPlus, FiTrash2, FiImage } from 'react-icons/fi';
import './AdminProductForm.css';

interface Product {
  _id?: string;
  name: string;
  brand: string;
  slug: string;
  price: string;
  condition: string;
  description: string;
  images: Array<{ url: string; alt: string }>;
  measurements: Record<string, string>;
  defects: string[];
  shipping: {
    method: string;
    estimatedDays: string;
  };
  tags: string[];
  isPublished: boolean;
  variantOptions?: Array<{ name: string; value: string }>;
  stock?: number;
  currency?: string;
}

const MEASUREMENT_PRESETS = {
  'Chest': 'cm',
  'Length': 'cm',
  'Sleeve': 'cm',
  'Waist': 'cm',
  'Inseam': 'cm',
  'Shoulder': 'cm',
  'Size': ''
};

const CONDITIONS = [
  { value: 'like-new', label: 'Like New' },
  { value: 'gently-used', label: 'Gently Used' },
  { value: 'used', label: 'Used' },
  { value: 'heavily-used', label: 'Heavily Used' }
];

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [product, setProduct] = useState<Product>({
    name: '',
    brand: '',
    slug: '',
    price: '',
    condition: 'gently-used',
    description: '',
    images: [],
    measurements: {},
    defects: [],
    shipping: { method: 'Indonesian Post', estimatedDays: '3-5' },
    tags: [],
    isPublished: false
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProduct(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('shipping.')) {
      const key = name.split('.')[1];
      setProduct(prev => ({
        ...prev,
        shipping: { ...prev.shipping, [key]: value }
      }));
    } else {
      setProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddImage = () => {
    setProduct(prev => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '' }]
    }));
  };

  const handleUpdateImage = (index: number, field: string, value: string) => {
    const updated = [...product.images];
    updated[index] = { ...updated[index], [field]: value };
    setProduct(prev => ({ ...prev, images: updated }));
  };

  const handleRemoveImage = (index: number) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddMeasurement = (preset: string) => {
    setProduct(prev => ({
      ...prev,
      measurements: { ...prev.measurements, [preset]: '' }
    }));
  };

  const handleUpdateMeasurement = (oldKey: string, newKey: string, value: string) => {
    const updated = { ...product.measurements };
    if (oldKey !== newKey) {
      delete updated[oldKey];
    }
    updated[newKey] = value;
    setProduct(prev => ({ ...prev, measurements: updated }));
  };

  const handleRemoveMeasurement = (key: string) => {
    const updated = { ...product.measurements };
    delete updated[key];
    setProduct(prev => ({ ...prev, measurements: updated }));
  };

  const handleAddDefect = () => {
    setProduct(prev => ({
      ...prev,
      defects: [...prev.defects, '']
    }));
  };

  const handleUpdateDefect = (index: number, value: string) => {
    const updated = [...product.defects];
    updated[index] = value;
    setProduct(prev => ({ ...prev, defects: updated }));
  };

  const handleRemoveDefect = (index: number) => {
    setProduct(prev => ({
      ...prev,
      defects: prev.defects.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = id ? 'PUT' : 'POST';
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const url = id 
        ? `${API_BASE_URL}/admin/products/${id}`
        : `${API_BASE_URL}/admin/products`;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      
      if (response.ok) {
        alert(id ? 'Product updated successfully!' : 'Product created successfully!');
        navigate('/admin/products');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  if (loading) {
    return (
      <div className="admin-product-form-loading">
        <div className="admin-product-form-loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-product-form">
      <form onSubmit={handleSubmit} className="admin-product-form-container">
        {/* Header */}
        <div className="admin-product-form-header">
          <h1 className="admin-product-form-title">
            {id ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="admin-product-form-desc">Manage your vintage clothing inventory</p>
        </div>

        <div className="admin-product-form-main">
          {/* Main Content */}
          <div>
            {/* Images Section */}
            <div className="admin-product-form-card">
              <h2 className="admin-product-form-section-title">Product Images</h2>
              <div className="admin-product-form-image-grid">
                {product.images.map((image, index) => (
                  <div key={index} className="admin-product-form-image-thumb">
                    {image.url ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img 
                          src={image.url} 
                          alt={image.alt || `Product ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="admin-product-form-image-remove"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ background: '#f3f4f6', borderRadius: 8, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiImage style={{ color: '#a1a1aa' }} size={32} />
                      </div>
                    )}
                    <input
                      type="text"
                      value={image.url}
                      onChange={(e) => handleUpdateImage(index, 'url', e.target.value)}
                      placeholder="Image URL"
                      style={{ marginTop: 8, width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddImage}
                className="admin-product-form-add-image"
              >
                <FiPlus size={18} />
                Add Image
              </button>
            </div>

            {/* Basic Info */}
            <div className="admin-product-form-card">
              <h2 className="admin-product-form-section-title">Basic Information</h2>
              <div className="admin-product-form-fields">
                <div className="admin-product-form-field">
                  <label className="input-label" htmlFor="product-name">Product Name *</label>
                  <input
                    id="product-name"
                    type="text"
                    value={product.name}
                    onChange={handleNameChange}
                    placeholder="e.g., Bape Spellout Hoodie"
                    className="input"
                    required
                  />
                </div>
                <div className="admin-product-form-row">
                  <div className="admin-product-form-field">
                    <label className="input-label" htmlFor="product-brand">Brand</label>
                    <input
                      id="product-brand"
                      type="text"
                      name="brand"
                      value={product.brand}
                      onChange={handleInputChange}
                      placeholder="e.g., A Bathing Ape"
                      className="input"
                    />
                  </div>
                  <div className="admin-product-form-field">
                    <label className="input-label" htmlFor="product-condition">Condition</label>
                    <select
                      id="product-condition"
                      name="condition"
                      value={product.condition}
                      onChange={handleInputChange}
                      className="input"
                    >
                      {CONDITIONS.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="admin-product-form-field">
                  <label className="input-label" htmlFor="product-price">Price *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id="product-price"
                      type="text"
                      name="price"
                      value={product.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 500000"
                      className="input"
                      required
                      style={{ flex: 2 }}
                    />
                    <select
                      id="product-currency"
                      name="currency"
                      value={product.currency || 'IDR'}
                      onChange={handleInputChange}
                      className="input"
                      style={{ flex: 1 }}
                      required
                    >
                      <option value="IDR">IDR</option>
                      <option value="USD">USD</option>
                      <option value="SGD">SGD</option>
                      <option value="MYR">MYR</option>
                      <option value="JPY">JPY</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                {/* Size field */}
                <div className="admin-product-form-field">
                  <label className="input-label" htmlFor="product-size">Size (pisahkan dengan koma)</label>
                  <input
                    id="product-size"
                    type="text"
                    name="size"
                    value={product.variantOptions && product.variantOptions[0]?.name === 'Size' ? product.variantOptions[0].value : ''}
                    onChange={e => {
                      const value = e.target.value;
                      setProduct(prev => ({
                        ...prev,
                        variantOptions: value.trim() ? [{ name: 'Size', value }] : undefined
                      }));
                    }}
                    placeholder="S, M, L, XL"
                    className="input"
                  />
                </div>
                {/* Stock field for non-variant product */}
                {(!product.variantOptions || product.variantOptions.length === 0) && (
                  <div className="admin-product-form-field">
                    <label className="input-label" htmlFor="product-stock">Stock (Qty)</label>
                    <input
                      id="product-stock"
                      type="number"
                      name="stock"
                      min={1}
                      value={product.stock ?? 1}
                      onChange={e => setProduct(prev => ({ ...prev, stock: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="input"
                      required
                    />
                  </div>
                )}
                <div className="admin-product-form-field">
                  <label className="input-label" htmlFor="product-description">Description</label>
                  <textarea
                    id="product-description"
                    name="description"
                    value={product.description}
                    onChange={handleInputChange}
                    placeholder="Describe the product, materials, style, condition details..."
                    rows={4}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Measurements */}
            <div className="admin-product-form-card">
              <h2 className="admin-product-form-section-title">Measurements</h2>
              <div className="admin-product-form-measurement-presets">
                <p className="input-label">Quick add presets:</p>
                <div className="admin-product-form-measurement-preset-list">
                  {Object.keys(MEASUREMENT_PRESETS).map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => !product.measurements[preset] && handleAddMeasurement(preset)}
                      disabled={product.measurements[preset] !== undefined}
                      className="admin-product-form-measurement-preset"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="admin-product-form-measurement-fields">
                {Object.entries(product.measurements).map(([key, value], index) => (
                  <div key={index} className="admin-product-form-measurement-row">
                    <div className="admin-product-form-field">
                      <label className="input-label">Type</label>
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => handleUpdateMeasurement(key, e.target.value, value)}
                        className="input"
                      />
                    </div>
                    <div className="admin-product-form-field">
                      <label className="input-label">Value</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleUpdateMeasurement(key, key, e.target.value)}
                        placeholder="e.g., 50cm"
                        className="input"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMeasurement(key)}
                      className="admin-dashboard-action-btn delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Defects */}
            <div className="admin-product-form-card">
              <h2 className="admin-product-form-section-title">Defects & Issues</h2>
              <div>
                {product.defects.map((defect, index) => (
                  <div key={index} className="admin-product-form-defect-row">
                    <input
                      type="text"
                      value={defect}
                      onChange={(e) => handleUpdateDefect(index, e.target.value)}
                      placeholder="e.g., Small stain on sleeve"
                      className="input"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDefect(index)}
                      className="admin-dashboard-action-btn delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddDefect}
                className="admin-product-form-add-image"
              >
                <FiPlus size={18} />
                Add Issue
              </button>
            </div>

            {/* Tags */}
            <div className="admin-product-form-card">
              <h2 className="admin-product-form-section-title">Tags</h2>
              <input
                type="text"
                value={product.tags.join(', ')}
                onChange={(e) => setProduct(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                placeholder="e.g., vintage, bape, streetwear, grailed"
                className="admin-product-form-tag-input"
              />
              <p className="admin-product-form-tag-desc">Separate tags with commas</p>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Preview Card */}
            <div className="admin-product-form-preview-card">
              <h3 className="admin-product-form-section-title" style={{ fontSize: 18, marginBottom: 16 }}>Preview</h3>
              <div className="admin-product-form-preview-content">
                {product.images[0] && (
                  <div className="admin-product-form-preview-image">
                    <img 
                      src={product.images[0].url} 
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div>
                  <h4 className="admin-product-form-title" style={{ fontSize: 18, marginBottom: 4 }}>{product.name || 'Product Name'}</h4>
                  <p className="input-label" style={{ marginBottom: 0 }}>{product.brand || 'Brand'}</p>
                </div>
                <div className="admin-product-form-preview-price">
                  <p className="admin-product-form-title" style={{ fontSize: 22 }}>
                    Rp {product.price ? parseInt(product.price).toLocaleString('id-ID') : '0'}
                  </p>
                  <p className="input-label" style={{ marginTop: 4 }}>
                    Condition: <span style={{ fontWeight: 500 }}>{CONDITIONS.find(c => c.value === product.condition)?.label}</span>
                  </p>
                </div>
                {product.tags.length > 0 && (
                  <div className="admin-product-form-tag-list">
                    {product.tags.map(tag => (
                      <span key={tag} className="admin-product-form-tag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Publish Card */}
            <div className="admin-product-form-publish-card">
              <div className="admin-product-form-publish-row">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={product.isPublished}
                  onChange={(e) => setProduct(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="admin-product-form-publish-checkbox"
                />
                <label className="input-label" style={{ marginBottom: 0 }}>
                  Publish Product
                </label>
              </div>
              <div className="admin-product-form-publish-status">
                {product.isPublished ? '✓ Product will be visible' : '○ Product is in draft'}
              </div>
              <div className="admin-product-form-publish-actions">
                <button
                  type="submit"
                  className="admin-product-form-publish-btn"
                >
                  {id ? 'Update' : 'Create'} Product
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="admin-product-form-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
