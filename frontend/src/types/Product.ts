export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductMeasurements {
  [key: string]: string | number | undefined;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  brand?: string;
  type?: string;
  price: number | string;
  currency?: string;
  condition?: string;
  description: string;
  images?: ProductImage[];
  measurements?: ProductMeasurements;
  defects?: string[];
  shipping?: {
    method?: string;
    estimatedDays?: string;
  };
  tags?: string[];
  stock: number;
  isPublished?: boolean;
  status?: 'available' | 'sold';
  ratings?: {
    average?: number;
    count?: number;
  };
  createdAt?: string;
  updatedAt?: string | { $date: string };
  category?: any;
  variants?: ProductVariant[];
  variantOptions?: any;
  skus?: any;
  priceRange?: { min: number; max: number };
  physical?: any;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariants?: { [key: string]: string };
}
