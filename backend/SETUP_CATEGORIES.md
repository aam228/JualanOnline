# Setup Categories & Variants System

## Overview
Sistem kategori dan variant memungkinkan produk memiliki:
- **Kategori utama** (contoh: Elektronik, Audio, Wearable)
- **Sub-kategori** (contoh: Laptop, Smartphone, Headphone)
- **Variants** (contoh: Warna, Ukuran, RAM, Storage)

## Database Collections

### 1. Categories Collection
```javascript
{
  _id: ObjectId,
  name: "Elektronik",
  icon: "💻",
  subcategories: [
    { id: "1", name: "Laptop" },
    { id: "2", name: "Smartphone" }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Variants Collection
```javascript
{
  _id: ObjectId,
  name: "Warna",
  options: ["Hitam", "Putih", "Biru", "Merah"],
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Products Collection (Updated)
```javascript
{
  _id: ObjectId,
  name: "Laptop Gaming ROG",
  price: 15000000,
  category: "Elektronik",        // Kategori utama
  subcategory: "Laptop",          // Sub-kategori
  description: "...",
  icon: "💻",
  stock: 10,
  status: "available",
  variants: [                     // Variants untuk produk ini
    {
      name: "RAM",
      options: ["8GB", "16GB", "32GB"]
    },
    {
      name: "Storage",
      options: ["256GB SSD", "512GB SSD", "1TB SSD"]
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure MongoDB
Pastikan file `.env` sudah dikonfigurasi:
```env
MONGODB_URI=mongodb://localhost:27017/anjay-ecommerce
PORT=5000
```

### 3. Seed Database

#### Option A: Seed Semua (Recommended)
```bash
npm run seed:all
```
Ini akan:
1. Seed categories dan variants
2. Seed products dengan kategori dan variants

#### Option B: Seed Terpisah
```bash
# Seed categories dan variants dulu
npm run seed:categories

# Kemudian seed products
npm run seed
```

### 4. Start Server
```bash
npm start
# atau untuk development
npm run dev
```

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `POST /api/categories/:id/subcategories` - Add subcategory
- `DELETE /api/categories/:id/subcategories/:subcategoryId` - Delete subcategory

### Variants
- `GET /api/variants` - Get all variant types
- `GET /api/variants/:id` - Get single variant type
- `POST /api/variants` - Create variant type
- `PUT /api/variants/:id` - Update variant type
- `DELETE /api/variants/:id` - Delete variant type

### Products (Updated)
- `GET /api/products` - Get all products (with category & variants)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Testing API

### 1. Get All Categories
```bash
curl http://localhost:5000/api/categories
```

### 2. Get All Variants
```bash
curl http://localhost:5000/api/variants
```

### 3. Get Products with Categories
```bash
curl http://localhost:5000/api/products
```

### 4. Create New Category
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fashion",
    "icon": "👕",
    "subcategories": [
      { "id": "1", "name": "Baju" },
      { "id": "2", "name": "Celana" }
    ]
  }'
```

### 5. Add Subcategory
```bash
curl -X POST http://localhost:5000/api/categories/[CATEGORY_ID]/subcategories \
  -H "Content-Type: application/json" \
  -d '{ "name": "Sepatu" }'
```

### 6. Create Product with Variants
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung Galaxy S24",
    "price": 12000000,
    "category": "Elektronik",
    "subcategory": "Smartphone",
    "description": "Smartphone flagship",
    "icon": "📱",
    "stock": 20,
    "status": "available",
    "variants": [
      {
        "name": "Warna",
        "options": ["Hitam", "Putih", "Ungu"]
      },
      {
        "name": "Storage",
        "options": ["128GB", "256GB", "512GB"]
      }
    ]
  }'
```

## Default Data

### Categories (5)
1. **Elektronik** 💻 - Laptop, Smartphone, Tablet, Monitor, Kamera
2. **Audio** 🎧 - Headphone, Earphone, Speaker, Microphone
3. **Wearable** ⌚ - Smartwatch, Fitness Tracker, Smart Glasses
4. **Aksesoris** 🖱️ - Keyboard, Mouse, Webcam, Charger, Cable, Case
5. **Gaming** 🎮 - Console, Controller, Gaming Chair, Gaming Desk

### Variant Types (10)
1. **Warna** - Hitam, Putih, Biru, Merah, Silver, Gold, Hijau, Pink
2. **Ukuran** - S, M, L, XL, XXL, 40mm, 44mm, 46mm, 24", 27", 32"
3. **RAM** - 4GB, 8GB, 16GB, 32GB, 64GB
4. **Storage** - 64GB, 128GB, 256GB, 512GB, 1TB, 2TB
5. **Resolusi** - 720p, 1080p, 2K, 4K, 8K
6. **Refresh Rate** - 60Hz, 75Hz, 120Hz, 144Hz, 165Hz, 240Hz
7. **Switch** - Blue, Red, Brown, Black, Silver
8. **Layout** - Full Size, TKL, 60%, 65%, 75%
9. **DPI** - 800, 1600, 3200, 6400, 8000, 12000, 16000
10. **Kapasitas Baterai** - 3000mAh, 4000mAh, 5000mAh, 6000mAh

## Troubleshooting

### Error: Cannot connect to MongoDB
```bash
# Pastikan MongoDB running
# Windows:
net start MongoDB

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### Error: Collection not found
```bash
# Run seed lagi
npm run seed:all
```

### Port already in use
```bash
# Ubah PORT di .env
PORT=5001
```

## Next Steps

1. ✅ Backend API sudah siap dengan categories & variants
2. 🔄 Update frontend untuk fetch dari API
3. 🔄 Buat admin panel untuk manage categories & variants
4. 🔄 Implement filter by category di frontend
