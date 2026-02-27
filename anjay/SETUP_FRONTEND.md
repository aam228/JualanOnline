# Setup Frontend untuk Connect ke Backend

## Status Saat Ini

✅ Backend sudah siap dengan struktur database baru
✅ API service sudah diupdate (`src/services/api.ts`)
✅ ProductList sudah diupdate untuk fetch dari API
❌ ProductDetailPage masih perlu diupdate

## Langkah Setup

### 1. Pastikan Backend Running

```bash
# Terminal 1 - Backend
cd backend

# Seed database dulu (reset & insert data baru)
npm run seed

# Start backend server
npm start

# Server akan jalan di http://localhost:5000
```

Output yang diharapkan:
```
🗑️  Cleared existing products
✅ Inserted 6 products

📦 Products in database:
...
✅ Database seeding completed
🚀 Server running on http://localhost:5000
```

### 2. Start Frontend

```bash
# Terminal 2 - Frontend
cd anjay
npm run dev

# Frontend akan jalan di http://localhost:5173
```

### 3. Test API Connection

Buka browser dan test:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/products

Kalau backend jalan, kamu akan lihat JSON data produk di http://localhost:5000/api/products

### 4. Troubleshooting

#### Error: "Gagal memuat produk"

**Penyebab:** Backend tidak jalan atau port salah

**Solusi:**
1. Cek backend running: `curl http://localhost:5000/api/products`
2. Kalau error, pastikan MongoDB running
3. Kalau port beda, update `.env` di frontend:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

#### Error: "Cannot connect to MongoDB"

**Penyebab:** MongoDB tidak running

**Solusi:**
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Products tidak muncul di frontend

**Penyebab:** Data belum di-seed atau backend belum jalan

**Solusi:**
1. Seed database: `cd backend && npm run seed`
2. Start backend: `npm start`
3. Refresh frontend

## Struktur Data Baru

### Product Object (dari API)

```typescript
{
  _id: "prod_iphone_15_pro_001",
  slug: "iphone-15-pro",
  name: "iPhone 15 Pro",
  brand: "Apple",
  category: {
    id: "cat_elektronik",
    name: "Elektronik",
    subcategory: {
      id: "subcat_smartphone",
      name: "Smartphone"
    }
  },
  description: {
    short: "Smartphone flagship...",
    long: "iPhone 15 Pro menghadirkan..."
  },
  images: [
    {
      url: "📱",
      alt: "iPhone 15 Pro tampak depan",
      isPrimary: true
    }
  ],
  priceRange: {
    min: 18000000,
    max: 26000000,
    currency: "IDR"
  },
  variantOptions: [
    {
      name: "Warna",
      type: "color",
      values: ["Hitam", "Putih", "Biru"]
    },
    {
      name: "Storage",
      type: "size",
      values: ["128GB", "256GB", "512GB", "1TB"]
    }
  ],
  skus: [
    {
      sku: "IP15P-BLK-128",
      isActive: true,
      variants: { Warna: "Hitam", Storage: "128GB" },
      stock: 5,
      price: 18000000,
      currency: "IDR"
    }
  ],
  physical: {
    weight: 187,
    weightUnit: "gram",
    dimensions: {
      length: 146.6,
      width: 70.6,
      height: 8.25,
      unit: "mm"
    }
  },
  tags: ["smartphone", "apple", "iphone"],
  isPublished: true,
  status: "available",
  ratings: {
    average: 4.8,
    count: 127
  }
}
```

## Yang Sudah Diupdate

### 1. API Service (`src/services/api.ts`)
- ✅ Type definitions untuk struktur baru
- ✅ Interface lengkap (Product, SKU, Category, dll)
- ✅ API methods (getAll, getById, create, update, delete)

### 2. ProductList Component (`src/components/ProductList.tsx`)
- ✅ Fetch dari API backend
- ✅ Display product dengan struktur baru
- ✅ Show price range (min - max)
- ✅ Show SOLD OUT status
- ✅ Error handling
- ✅ Loading state

## Yang Perlu Diupdate (Next Steps)

### 1. ProductDetailPage
- ❌ Masih pake data dummy dari `products.ts`
- ❌ Perlu fetch dari API
- ❌ Perlu handle SKU selection
- ❌ Perlu show variant options dari database

### 2. Cart Context
- ❌ Perlu update untuk handle SKU
- ❌ Perlu simpan selected SKU, bukan cuma product

### 3. ProductCard Component
- ❌ Bisa dihapus (sudah tidak dipakai)

## Quick Test

### Test 1: Backend API
```bash
curl http://localhost:5000/api/products
```

Expected: JSON array dengan 6 products

### Test 2: Frontend
1. Buka http://localhost:5173
2. Lihat homepage
3. Seharusnya muncul 6 produk dari database

### Test 3: Product Detail
1. Klik salah satu produk
2. Akan error karena ProductDetailPage belum diupdate
3. Normal, nanti akan diupdate

## Environment Variables

### Frontend (`.env` di folder `anjay`)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (`.env` di folder `backend`)
```env
MONGODB_URI=mongodb://localhost:27017/anjay-ecommerce
PORT=5000
```

## Summary

✅ **Backend**: Ready dengan struktur database baru
✅ **API**: Ready dengan endpoints lengkap
✅ **ProductList**: Ready fetch dari API
⏳ **ProductDetailPage**: Perlu diupdate (next step)
⏳ **Cart**: Perlu diupdate untuk handle SKU (next step)

Untuk sekarang, **ProductList sudah bisa tampil data dari database**! 🎉
