
import React, { useState, useEffect, useRef } from 'react';
import { productAPI, type Product } from '../services/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import './CollectionsPage.css';

const PRODUCTS_PER_PAGE = 32;


const CollectionsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    productAPI.getAll()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products');
        setLoading(false);
      });
  }, []);

  // Generate category summary from fetched products
  const categorySummary: { [category: string]: number } = {};
  products.forEach((product) => {
    // Support both string and object category
    let cat = typeof product.category === 'string' ? product.category : product.category?.name;
    if (cat) {
      categorySummary[cat] = (categorySummary[cat] || 0) + 1;
    }
  });
  const categories = Object.keys(categorySummary);

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter((p) => {
        let cat = typeof p.category === 'string' ? p.category : p.category?.name;
        return cat === selectedCategory;
      })
    : [];

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Handle page change and scroll to top
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const visibleProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
    return <div className="collections-page"><h1 className="collections-title">Collections</h1><div>Loading...</div></div>;
  }
  if (error) {
    return <div className="collections-page"><h1 className="collections-title">Collections</h1><div>{error}</div></div>;
  }

  return (
    <div className="collections-page">
      <h1 className="collections-title">Collections</h1>
      {!selectedCategory ? (
        <div className="collections-list">
          {categories.length === 0 ? (
            <div>No categories found.</div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat}
                className="collection-card"
                onClick={() => setSelectedCategory(cat)}
              >
                <div className="collection-name">{cat}</div>
                <div className="collection-count">{categorySummary[cat]} product{categorySummary[cat] > 1 ? 's' : ''}</div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          <button className="back-btn" onClick={() => setSelectedCategory(null)}>
            &larr; Back to Collections
          </button>
          <h2 className="category-title">{selectedCategory}</h2>
          <div className="products-grid" ref={gridRef}>
            {visibleProducts.length === 0 ? (
              <div className="no-products">No products found in this category.</div>
            ) : (
              visibleProducts.map((product, idx) => (
                <ProductCard key={product._id || idx} product={product} />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
