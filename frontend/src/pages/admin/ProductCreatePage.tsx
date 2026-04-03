import React from 'react';
import ProductForm from '../../components/admin/ProductForm';
import ProductPreview from '../../components/admin/ProductPreview';

const ProductCreatePage: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Desktop: 2-column, Mobile: single column */}
      <aside className="md:w-1/3 w-full p-4 sticky top-0 h-fit bg-gray-100 border-r border-gray-200">
        <ProductPreview />
      </aside>
      <main className="md:w-2/3 w-full p-4">
        <h1 className="text-2xl font-bold mb-4">Create Product</h1>
        <ProductForm />
      </main>
      {/* TODO: Mobile bottom action bar */}
    </div>
  );
};

export default ProductCreatePage;

// TODO: Add route to App.tsx for /admin/products/create