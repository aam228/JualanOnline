import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiImage, FiPlus, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';

interface ProductImage {
  url: string;
  alt: string;
}

interface ProductFormState {
  name: string;
  brand: string;
  category: string;
  type: string;
  price: string;
  size: string;
  condition: string;
  stock: string;
  description: string;
  images: ProductImage[];
  isPublished: boolean;
}

const CONDITION_OPTIONS = [
  { value: 'like-new', label: 'Like New' },
  { value: 'gently-used', label: 'Gently Used' },
  { value: 'used', label: 'Used' },
  { value: 'heavily-used', label: 'Heavily Used' }
];

const createEmptyImage = (): ProductImage => ({ url: '', alt: '' });

const createInitialState = (): ProductFormState => ({
  name: '',
  brand: '',
  category: '',
  type: '',
  price: '',
  size: '',
  condition: 'gently-used',
  stock: '1',
  description: '',
  images: [createEmptyImage()],
  isPublished: false
});

const normalizeImages = (images: unknown): ProductImage[] => {
  if (!Array.isArray(images) || images.length === 0) {
    return [createEmptyImage()];
  }

  return images.map((image) => {
    if (typeof image === 'string') {
      return { url: image, alt: '' };
    }

    if (image && typeof image === 'object') {
      const currentImage = image as { url?: unknown; alt?: unknown; preview?: unknown };
      const url = typeof currentImage.url === 'string'
        ? currentImage.url
        : typeof currentImage.preview === 'string'
          ? currentImage.preview
          : '';
      const alt = typeof currentImage.alt === 'string' ? currentImage.alt : '';

      return { url, alt };
    }

    return createEmptyImage();
  });
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState<ProductFormState>(createInitialState());

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_BASE_URL}/admin/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }

        const data = await response.json();
        setProduct({
          name: data.name || '',
          brand: data.brand || '',
          category: typeof data.category === 'string' ? data.category : data.category?.name || '',
          type: data.type || '',
          price: data.price !== undefined && data.price !== null ? String(data.price) : '',
          size: data.size || data.measurements?.Size || data.measurements?.size || '',
          condition: data.condition || 'gently-used',
          stock: String(
            typeof data.stock === 'number'
              ? data.stock
              : Array.isArray(data.skus)
                ? data.skus.reduce((total: number, sku: { stock?: number }) => total + (typeof sku.stock === 'number' ? sku.stock : 0), 0)
                : 1
          ),
          description: data.description || '',
          images: normalizeImages(data.images),
          isPublished: Boolean(data.isPublished)
        });
      } catch (fetchError) {
        console.error('Error fetching product:', fetchError);
        setError('Failed to load product data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const updateImage = (index: number, field: keyof ProductImage, value: string) => {
    setProduct((previous) => {
      const images = [...previous.images];
      images[index] = { ...images[index], [field]: value };
      return { ...previous, images };
    });
  };

  const addImage = () => {
    setProduct((previous) => ({
      ...previous,
      images: [...previous.images, createEmptyImage()]
    }));
  };

  const removeImage = (index: number) => {
    setProduct((previous) => ({
      ...previous,
      images: previous.images.filter((_, imageIndex) => imageIndex !== index)
    }));
  };

  const getPriceValue = () => {
    const priceValue = Number(product.price);
    return Number.isFinite(priceValue) ? priceValue : 0;
  };

  const getStockValue = () => {
    const stockValue = Number(product.stock);
    return Number.isFinite(stockValue) ? stockValue : 0;
  };

  const filteredImages = product.images
    .map((image) => ({
      url: image.url.trim(),
      alt: image.alt.trim()
    }))
    .filter((image) => image.url.length > 0);

  const validateProduct = () => {
    if (!product.name.trim()) return 'Product name is required.';
    if (!product.brand.trim()) return 'Brand is required.';
    if (!product.category.trim()) return 'Category is required.';
    if (!product.type.trim()) return 'Type is required.';
    if (!product.size.trim()) return 'Size is required.';
    if (!product.description.trim()) return 'Description is required.';
    if (getPriceValue() <= 0) return 'Price must be greater than zero.';
    if (getStockValue() < 0) return 'Stock cannot be negative.';
    if (filteredImages.length === 0) return 'Add at least one product photo.';
    return '';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateProduct();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        name: product.name.trim(),
        brand: product.brand.trim(),
        category: product.category.trim(),
        type: product.type.trim(),
        price: getPriceValue(),
        size: product.size.trim(),
        condition: product.condition,
        stock: getStockValue(),
        description: product.description.trim(),
        images: filteredImages,
        measurements: product.size.trim() ? { Size: product.size.trim() } : {},
        isPublished: product.isPublished
      };

      const response = await fetch(
        id ? `${API_BASE_URL}/admin/products/${id}` : `${API_BASE_URL}/admin/products`,
        {
          method: id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        }
      );

      if (response.status === 401 || response.status === 403) {
        setError('Unauthorized. Please login again.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save product' }));
        throw new Error(errorData.error || 'Failed to save product');
      }

      navigate('/admin/products');
    } catch (submitError) {
      console.error('Error saving product:', submitError);
      setError(submitError instanceof Error ? submitError.message : 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
          Loading product form...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link to="/admin/products" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
              Back to products
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {id ? 'Edit Product' : 'Add Product'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Streamlined form for a limited streetwear catalog. Keep the input focused on the fields the store actually needs: core identity, size, condition, stock, photos, and description.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            Single create and edit flow
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Product Details</h2>
                  <p className="mt-1 text-sm text-slate-600">Use concise values that are easy to verify in a small catalog.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Product Name *</span>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(event) => setProduct((previous) => ({ ...previous, name: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                    placeholder="Bape Spellout Hoodie"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Brand *</span>
                  <input
                    type="text"
                    value={product.brand}
                    onChange={(event) => setProduct((previous) => ({ ...previous, brand: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                    placeholder="A Bathing Ape"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Category *</span>
                  <input
                    type="text"
                    value={product.category}
                    onChange={(event) => setProduct((previous) => ({ ...previous, category: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                    placeholder="Hoodie, Pants, Hat, Tee"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Type *</span>
                  <input
                    type="text"
                    value={product.type}
                    onChange={(event) => setProduct((previous) => ({ ...previous, type: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                    placeholder="Streetwear, collectible, workwear"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Price (IDR) *</span>
                  <input
                    type="number"
                    min="0"
                    value={product.price}
                    onChange={(event) => setProduct((previous) => ({ ...previous, price: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                    placeholder="500000"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Size *</span>
                  <input
                    type="text"
                    value={product.size}
                    onChange={(event) => setProduct((previous) => ({ ...previous, size: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                    placeholder="L, XL, 32, OS, etc."
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Condition</span>
                  <select
                    value={product.condition}
                    onChange={(event) => setProduct((previous) => ({ ...previous, condition: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                  >
                    {CONDITION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Stock *</span>
                  <input
                    type="number"
                    min="0"
                    value={product.stock}
                    onChange={(event) => setProduct((previous) => ({ ...previous, stock: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                    placeholder="1"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Photos</h2>
                  <p className="mt-1 text-sm text-slate-600">Add the photos that are necessary to evaluate the item quickly.</p>
                </div>
                <button
                  type="button"
                  onClick={addImage}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                >
                  <FiPlus size={16} />
                  Add image
                </button>
              </div>

              <div className="space-y-4">
                {product.images.map((image, index) => (
                  <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[96px_minmax(0,1fr)]">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      {image.url ? (
                        <img src={image.url} alt={image.alt || `Product image ${index + 1}`} className="h-full w-full object-cover" />
                      ) : (
                        <FiImage size={28} className="text-slate-400" />
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] md:items-start">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Image URL</span>
                        <input
                          type="text"
                          value={image.url}
                          onChange={(event) => updateImage(index, 'url', event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                          placeholder="https://..."
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Alt text</span>
                        <input
                          type="text"
                          value={image.alt}
                          onChange={(event) => updateImage(index, 'alt', event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                          placeholder="Front view"
                        />
                      </label>
                      <div className="pt-7">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Remove image"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Description</h2>
                <p className="mt-1 text-sm text-slate-600">Keep it focused on fit, condition notes, and what makes the item relevant.</p>
              </div>
              <textarea
                value={product.description}
                onChange={(event) => setProduct((previous) => ({ ...previous, description: event.target.value }))}
                rows={6}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                placeholder="Describe the fit, fabric, flaws, and any notes the buyer should know."
              />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Publish Status</h2>
                  <p className="mt-1 text-sm text-slate-600">Draft items stay hidden until you are ready to show them.</p>
                </div>
                <label className="inline-flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={product.isPublished}
                    onChange={(event) => setProduct((previous) => ({ ...previous, isPublished: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  Publish product
                </label>
              </div>
            </section>

            <div className="flex flex-wrap gap-3 pb-2">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Preview</h3>
              <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                <div className="aspect-[4/5] bg-slate-100">
                  {filteredImages[0] ? (
                    <img
                      src={filteredImages[0].url}
                      alt={filteredImages[0].alt || 'Preview image'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <FiImage size={40} />
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{product.name || 'Product name'}</p>
                    <p className="text-sm text-slate-500">{product.brand || 'Brand'} · {product.size || 'Size'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      {CONDITION_OPTIONS.find((option) => option.value === product.condition)?.label || 'Condition'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      Stock {product.stock || '0'}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${product.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {product.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-slate-900">
                      Rp {getPriceValue().toLocaleString('id-ID')}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Core product fields only, optimized for a small catalog.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">What is kept</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Product identity: name, brand, category, type, and price.</li>
                <li>Limited inventory fields: size, stock, condition, and publish state.</li>
                <li>Photos and description for quick review before publishing.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;
