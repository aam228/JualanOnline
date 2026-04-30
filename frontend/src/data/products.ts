import type { Product } from '../types/Product';

export const products: Product[] = [
  {
    name: 'Laptop Gaming Pro',
    price: 15000000,
    images: [{ url: '💻' }],
    category: 'Electronics',
    description: 'Gaming laptop with high-end specs, 16GB RAM, 512GB SSD',
    stock: 10,
    status: 'available',
    variants: [
      { name: 'RAM', options: ['8GB', '16GB', '32GB'] },
      { name: 'Storage', options: ['256GB SSD', '512GB SSD', '1TB SSD'] }
    ]
  },
  {
    name: 'Smartphone Premium',
    price: 8000000,
    images: [{ url: '📱' }],
    category: 'Electronics',
    description: 'Flagship smartphone with a 108MP camera and AMOLED display',
    stock: 0,
    status: 'sold',
    variants: [
      { name: 'Color', options: ['Black', 'White', 'Blue', 'Red'] },
      { name: 'Storage', options: ['128GB', '256GB', '512GB'] }
    ]
  },
  {
    name: 'Headphone Wireless',
    price: 1500000,
    images: [{ url: '🎧' }],
    category: 'Audio',
    description: 'Wireless headphones with noise cancelling and boosted bass',
    stock: 20,
    status: 'available',
    variants: [
      { name: 'Color', options: ['Black', 'White', 'Silver'] }
    ]
  },
  {
    name: 'Smartwatch Sport',
    price: 2500000,
    images: [{ url: '⌚' }],
    category: 'Wearable',
    description: 'Smartwatch with fitness tracking and health monitoring features',
    stock: 12,
    status: 'available',
    variants: [
      { name: 'Size', options: ['40mm', '44mm', '46mm'] },
      { name: 'Color', options: ['Black', 'Silver', 'Gold'] }
    ]
  },
  {
    name: 'Keyboard Mechanical',
    price: 1200000,
    images: [{ url: '⌨️' }],
    category: 'Aksesoris',
    description: 'RGB mechanical keyboard with blue switches',
    stock: 0,
    status: 'sold',
    variants: [
      { name: 'Switch', options: ['Blue', 'Red', 'Brown'] },
      { name: 'Layout', options: ['Full Size', 'TKL', '60%'] }
    ]
  },
  {
    name: 'Mouse Gaming RGB',
    price: 500000,
    images: [{ url: '🖱️' }],
    category: 'Aksesoris',
    description: 'Gaming mouse with up to 16000 DPI and RGB lighting',
    stock: 25,
    status: 'available',
    variants: [
      { name: 'DPI', options: ['8000', '12000', '16000'] }
    ]
  },
  {
    name: 'Monitor 4K UHD',
    price: 5000000,
    images: [{ url: '🖥️' }],
    category: 'Electronics',
    description: '27-inch 4K monitor with a 144Hz refresh rate',
    stock: 6,
    status: 'available',
    variants: [
      { name: 'Size', options: ['24 inch', '27 inch', '32 inch'] },
      { name: 'Refresh Rate', options: ['60Hz', '144Hz', '240Hz'] }
    ]
  },
  {
    name: 'Webcam HD Pro',
    price: 800000,
    images: [{ url: '📷' }],
    category: 'Aksesoris',
    description: '1080p webcam with autofocus and built-in microphone',
    stock: 18,
    status: 'available',
    variants: [
      { name: 'Resolution', options: ['720p', '1080p', '4K'] }
    ]
  },
  {
    name: 'Speaker Bluetooth',
    price: 600000,
    images: [{ url: '🔊' }],
    category: 'Audio',
    description: 'Portable speaker with powerful bass and 12-hour battery life',
    stock: 30,
    status: 'available',
    variants: [
      { name: 'Color', options: ['Black', 'Blue', 'Red', 'Green'] },
      { name: 'Size', options: ['Small', 'Medium', 'Large'] }
    ]
  }
]
