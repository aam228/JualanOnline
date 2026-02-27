const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  subcategory: {
    id: string;
    name: string;
  };
}

export interface ProductDescription {
  short: string;
  long: string;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface VariantOption {
  name: string;
  type: string;
  values: string[];
}

export interface SKU {
  sku: string;
  isActive: boolean;
  variants: { [key: string]: string };
  stock: number;
  price: number;
  currency: string;
}

export interface Physical {
  weight: number;
  weightUnit: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}

export interface Ratings {
  average: number;
  count: number;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: ProductDescription;
  images: ProductImage[];
  priceRange: PriceRange;
  variantOptions: VariantOption[];
  skus: SKU[];
  physical: Physical;
  tags: string[];
  isPublished: boolean;
  status: 'available' | 'sold';
  ratings: Ratings;
  createdAt: string;
  updatedAt: string;
}

export const productAPI = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  // Get single product
  getById: async (id: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  // Create product
  create: async (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  // Update product
  update: async (id: string, product: Partial<Product>): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to update product');
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
  },
};
