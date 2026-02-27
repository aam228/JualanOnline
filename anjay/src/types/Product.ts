export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  icon: string;
  category: string;
  description: string;
  stock: number;
  status?: 'available' | 'sold';
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariants?: { [key: string]: string };
}
