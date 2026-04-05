import React, { useState, useEffect, useRef } from 'react';
import { productAPI, type Product } from '../services/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import './AllProductsPage.css';

const PRODUCTS_PER_PAGE = 32;
type SortOption = 'newest' | 'a-z' | 'z-a' | 'price-low' | 'price-high';

const AllProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  // Fetch all products
  useEffect(() => {
    setLoading(true);
    setError(null);
    productAPI
      .getAll()
      .then((data) => {
        // Filter published products
        const publishedProducts = data.filter((p) => p.isPublished);
        setProducts(publishedProducts);
        setSortedProducts(publishedProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products');
        setLoading(false);
      });
  }, []);

  // Handle sorting
  useEffect(() => {
    let sorted = [...products];

    switch (sortOption) {
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        break;

      case 'a-z':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'z-a':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case 'price-low':
        sorted.sort((a, b) => {
          const priceA =
            a.price || (a.priceRange?.min ?? 0);
          const priceB =
            b.price || (b.priceRange?.min ?? 0);
          return priceA - priceB;
        });
        break;

      case 'price-high':
        sorted.sort((a, b) => {
          const priceA =
            a.price || (a.priceRange?.min ?? 0);
          const priceB =
            b.price || (b.priceRange?.min ?? 0);
          return priceB - priceA;
        });
        break;

      default:
        break;
    }

    setSortedProducts(sorted);
    // Reset to page 1 when sorting changes
    setCurrentPage(1);
  }, [sortOption, products]);

  // Handle page change and scroll to top
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const visibleProducts = sortedProducts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="all-products-page">
        <h1 className="page-title">All Products</h1>
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-products-page">
        <h1 className="page-title">All Products</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="all-products-page">
      <div className="page-header">
        <h1 className="page-title">All Products</h1>
        <div className="sort-control">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="a-z">A → Z</option>
            <option value="z-a">Z → A</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="no-products">
          <p>No products found</p>
        </div>
      ) : (
        <>
          <div className="products-grid" ref={gridRef}>
            {visibleProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          <div className="product-count">
            Showing {visibleProducts.length} of {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
};

export default AllProductsPage;
