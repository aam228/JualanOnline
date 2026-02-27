import type { Product } from '../types/Product';

export const products: Product[] = [
  {
    id: 1,
    name: 'Laptop Gaming Pro',
    price: 15000000,
    image: '💻',
    icon: '💻',
    category: 'Elektronik',
    description: 'Laptop gaming dengan spesifikasi tinggi, RAM 16GB, SSD 512GB',
    stock: 10,
    status: 'available',
    variants: [
      { name: 'RAM', options: ['8GB', '16GB', '32GB'] },
      { name: 'Storage', options: ['256GB SSD', '512GB SSD', '1TB SSD'] }
    ]
  },
  {
    id: 2,
    name: 'Smartphone Premium',
    price: 8000000,
    image: '📱',
    icon: '📱',
    category: 'Elektronik',
    description: 'Smartphone flagship dengan kamera 108MP dan layar AMOLED',
    stock: 0,
    status: 'sold',
    variants: [
      { name: 'Warna', options: ['Hitam', 'Putih', 'Biru', 'Merah'] },
      { name: 'Storage', options: ['128GB', '256GB', '512GB'] }
    ]
  },
  {
    id: 3,
    name: 'Headphone Wireless',
    price: 1500000,
    image: '🎧',
    icon: '🎧',
    category: 'Audio',
    description: 'Headphone wireless dengan noise cancelling dan bass boost',
    stock: 20,
    status: 'available',
    variants: [
      { name: 'Warna', options: ['Hitam', 'Putih', 'Silver'] }
    ]
  },
  {
    id: 4,
    name: 'Smartwatch Sport',
    price: 2500000,
    image: '⌚',
    icon: '⌚',
    category: 'Wearable',
    description: 'Smartwatch dengan fitur tracking olahraga dan monitor kesehatan',
    stock: 12,
    status: 'available',
    variants: [
      { name: 'Ukuran', options: ['40mm', '44mm', '46mm'] },
      { name: 'Warna', options: ['Hitam', 'Silver', 'Gold'] }
    ]
  },
  {
    id: 5,
    name: 'Keyboard Mechanical',
    price: 1200000,
    image: '⌨️',
    icon: '⌨️',
    category: 'Aksesoris',
    description: 'Keyboard mechanical RGB dengan switch blue',
    stock: 0,
    status: 'sold',
    variants: [
      { name: 'Switch', options: ['Blue', 'Red', 'Brown'] },
      { name: 'Layout', options: ['Full Size', 'TKL', '60%'] }
    ]
  },
  {
    id: 6,
    name: 'Mouse Gaming RGB',
    price: 500000,
    image: '🖱️',
    icon: '🖱️',
    category: 'Aksesoris',
    description: 'Mouse gaming dengan DPI hingga 16000 dan RGB lighting',
    stock: 25,
    status: 'available',
    variants: [
      { name: 'DPI', options: ['8000', '12000', '16000'] }
    ]
  },
  {
    id: 7,
    name: 'Monitor 4K UHD',
    price: 5000000,
    image: '🖥️',
    icon: '🖥️',
    category: 'Elektronik',
    description: 'Monitor 27 inch 4K dengan refresh rate 144Hz',
    stock: 6,
    status: 'available',
    variants: [
      { name: 'Ukuran', options: ['24 inch', '27 inch', '32 inch'] },
      { name: 'Refresh Rate', options: ['60Hz', '144Hz', '240Hz'] }
    ]
  },
  {
    id: 8,
    name: 'Webcam HD Pro',
    price: 800000,
    image: '📷',
    icon: '📷',
    category: 'Aksesoris',
    description: 'Webcam 1080p dengan autofocus dan mikrofon built-in',
    stock: 18,
    status: 'available',
    variants: [
      { name: 'Resolusi', options: ['720p', '1080p', '4K'] }
    ]
  },
  {
    id: 9,
    name: 'Speaker Bluetooth',
    price: 600000,
    image: '🔊',
    icon: '🔊',
    category: 'Audio',
    description: 'Speaker portable dengan bass powerful dan battery 12 jam',
    stock: 30,
    status: 'available',
    variants: [
      { name: 'Warna', options: ['Hitam', 'Biru', 'Merah', 'Hijau'] },
      { name: 'Ukuran', options: ['Small', 'Medium', 'Large'] }
    ]
  }
]
