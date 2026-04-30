import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';

interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

interface ProductImage {
  url: string;
  alt?: string;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  size?: string;
  condition?: string;
  description?: string;
  price?: number;
  priceRange?: PriceRange;
  stock?: number;
  images?: ProductImage[];
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

const LOW_STOCK_THRESHOLD = 3;

const getProductPriceLabel = (product: Product) => {
  if (product.priceRange) {
    return `${product.priceRange.currency} ${product.priceRange.max.toLocaleString('id-ID')}`;
  }

  if (typeof product.price === 'number' && Number.isFinite(product.price)) {
    return `Rp ${product.price.toLocaleString('id-ID')}`;
  }

  return 'Price not set';
};

const getProductStock = (product: Product) => {
  if (typeof product.stock === 'number' && Number.isFinite(product.stock)) {
    return product.stock;
  }

  return 0;
};

const getProductImage = (product: Product) => product.images?.[0]?.url || '';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/admin/products?limit=100&page=1`, {
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
      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (fetchError) {
      console.error('Error fetching products:', fetchError);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product from the catalog?')) {
      return;
    }

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

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts((previous) => previous.filter((product) => product._id !== id));
    } catch (deleteError) {
      console.error('Error deleting product:', deleteError);
      setError('Failed to delete product');
    }
  };

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      return [product.name, product.brand, product.size, product.condition]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    });
  }, [products, searchTerm]);

  const summary = useMemo(() => {
    const total = products.length;
    const published = products.filter((product) => product.isPublished).length;
    const draft = total - published;
    const lowStock = products.filter((product) => getProductStock(product) <= LOW_STOCK_THRESHOLD).length;

    return { total, published, draft, lowStock };
  }, [products]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Admin workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Product overview</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Focused dashboard for a small clothing catalog. The main goal is quick visibility of stock, publish state, and direct access to edit or remove items.
            </p>
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total products</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{summary.total}</p>
            <p className="mt-2 text-sm text-slate-500">All items in the limited catalog.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Published</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-600">{summary.published}</p>
            <p className="mt-2 text-sm text-slate-500">Visible to customers.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Draft</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-amber-600">{summary.draft}</p>
            <p className="mt-2 text-sm text-slate-500">Still hidden from the storefront.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Low stock</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-rose-600">{summary.lowStock}</p>
            <p className="mt-2 text-sm text-slate-500">Items at or below {LOW_STOCK_THRESHOLD} units.</p>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            <Search size={18} className="shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Search by name, brand, size, or condition"
            />
          </label>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Loading products...</div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Package size={24} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">No products yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Add the first item to start managing the limited catalog.
            </p>
            <Link
              to="/admin/products/new"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Product
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const stock = getProductStock(product);
              const imageUrl = getProductImage(product);
              const lowStock = stock <= LOW_STOCK_THRESHOLD;

              return (
                <article key={product._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <Package size={42} />
                      </div>
                    )}
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${product.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </span>
                      {lowStock && (
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                          Low stock
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{product.name}</h2>
                          <p className="mt-1 text-sm text-slate-500">{product.brand || 'No brand'} · {product.size || 'No size'}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium text-slate-900">{getProductPriceLabel(product)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Stock</p>
                        <p className={`mt-1 text-lg font-semibold ${lowStock ? 'text-rose-600' : 'text-slate-900'}`}>{stock}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Condition</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{product.condition || '-'}</p>
                      </div>
                    </div>

                    {product.description && (
                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                        {product.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/admin/products/${product._id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                      >
                        <Pencil size={16} />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>Dashboard now prioritizes visibility for small inventory instead of marketplace-style pagination.</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
            <AlertTriangle size={18} className="text-amber-600" />
            <span>Low stock items are surfaced visually so the admin can act before they run out.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
