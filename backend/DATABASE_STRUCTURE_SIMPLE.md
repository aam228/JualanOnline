# Database Structure - Anjay E-commerce (Simplified)

## Database Name
```
anjay-ecommerce
```

## Collections Overview

Database ini memiliki **1 collection utama**:
- **products** - Menyimpan SEMUA data produk termasuk kategori, sub-kategori, dan variants

---

## Products Collection (All-in-One)

### Purpose
Menyimpan semua data produk lengkap dalam satu document. Tidak ada relasi, semua data embedded.

### Schema
```javascript
{
  _id: ObjectId("..."),                    // MongoDB auto-generated ID
  name: String,                            // Nama produk
  price: Number,                           // Harga produk (dalam Rupiah)
  category: String,                        // Kategori utama (contoh: "Elektronik")
  subcategory: String,                     // Sub-kategori (contoh: "Laptop")
  description: String,                     // Deskripsi produk
  icon: String,                            // Emoji icon produk
  stock: Number,                           // Jumlah stok tersedia
  status: String,                          // Status: "available" atau "sold"
  variants: [                              // Array variants KHUSUS untuk produk ini
    {
      name: String,                        // Nama variant (contoh: "RAM")
      options: [String]                    // Pilihan untuk variant ini (contoh: ["8GB", "16GB", "32GB"])
    }
  ],
  createdAt: Date,                         // Timestamp dibuat
  updatedAt: Date                          // Timestamp terakhir diupdate
}
```

### Keuntungan Struktur Ini:

✅ **Fleksibel**: Setiap produk bisa punya variant yang berbeda-beda
✅ **Tidak Baku**: Variant bisa disesuaikan per produk
✅ **Simple**: Hanya 1 collection, tidak perlu JOIN
✅ **Fast**: Query langsung, tidak perlu lookup ke collection lain
✅ **Easy to Manage**: Semua data produk ada di satu tempat

### Example Data

#### Produk 1: Laptop dengan RAM & Storage
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789012347"),
  name: "Laptop Gaming ROG",
  price: 15000000,
  category: "Elektronik",
  subcategory: "Laptop",
  description: "Laptop gaming dengan spesifikasi tinggi",
  icon: "💻",
  stock: 10,
  status: "available",
  variants: [
    {
      name: "RAM",
      options: ["8GB", "16GB", "32GB"]
    },
    {
      name: "Storage",
      options: ["256GB SSD", "512GB SSD", "1TB SSD"]
    }
  ],
  createdAt: ISODate("2024-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:00:00.000Z")
}
```

#### Produk 2: Smartphone dengan Warna & Storage
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789012348"),
  name: "iPhone 15 Pro Max",
  price: 20000000,
  category: "Elektronik",
  subcategory: "Smartphone",
  description: "Smartphone flagship terbaru dari Apple",
  icon: "📱",
  stock: 15,
  status: "available",
  variants: [
    {
      name: "Warna",
      options: ["Hitam", "Putih", "Biru", "Titanium"]
    },
    {
      name: "Storage",
      options: ["128GB", "256GB", "512GB", "1TB"]
    }
  ],
  createdAt: ISODate("2024-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:00:00.000Z")
}
```

#### Produk 3: Baju dengan Ukuran & Warna
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789012349"),
  name: "Kaos Polos Premium",
  price: 150000,
  category: "Fashion",
  subcategory: "Baju",
  description: "Kaos polos cotton combed 30s",
  icon: "👕",
  stock: 50,
  status: "available",
  variants: [
    {
      name: "Ukuran",
      options: ["S", "M", "L", "XL", "XXL"]
    },
    {
      name: "Warna",
      options: ["Hitam", "Putih", "Abu-abu", "Navy", "Merah"]
    }
  ],
  createdAt: ISODate("2024-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:00:00.000Z")
}
```

#### Produk 4: Headphone hanya dengan Warna
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f678901234a"),
  name: "Sony WH-1000XM5",
  price: 5000000,
  category: "Audio",
  subcategory: "Headphone",
  description: "Headphone noise cancelling terbaik",
  icon: "🎧",
  stock: 20,
  status: "available",
  variants: [
    {
      name: "Warna",
      options: ["Hitam", "Silver", "Putih"]
    }
  ],
  createdAt: ISODate("2024-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:00:00.000Z")
}
```

#### Produk 5: Produk tanpa variant
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f678901234b"),
  name: "Charger USB-C 65W",
  price: 250000,
  category: "Aksesoris",
  subcategory: "Charger",
  description: "Charger fast charging USB-C 65W",
  icon: "🔌",
  stock: 100,
  status: "available",
  variants: [],                            // Tidak ada variant
  createdAt: ISODate("2024-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:00:00.000Z")
}
```

---

## Contoh Use Cases

### 1. Produk Elektronik
```javascript
category: "Elektronik"
subcategory: "Laptop" | "Smartphone" | "Tablet" | "Monitor"
variants: [
  { name: "RAM", options: ["8GB", "16GB", "32GB"] },
  { name: "Storage", options: ["256GB", "512GB", "1TB"] }
]
```

### 2. Produk Fashion
```javascript
category: "Fashion"
subcategory: "Baju" | "Celana" | "Sepatu"
variants: [
  { name: "Ukuran", options: ["S", "M", "L", "XL"] },
  { name: "Warna", options: ["Hitam", "Putih", "Biru"] }
]
```

### 3. Produk Audio
```javascript
category: "Audio"
subcategory: "Headphone" | "Speaker" | "Earphone"
variants: [
  { name: "Warna", options: ["Hitam", "Putih", "Silver"] }
]
```

### 4. Produk Gaming
```javascript
category: "Gaming"
subcategory: "Console" | "Controller"
variants: [
  { name: "Warna", options: ["Hitam", "Putih"] },
  { name: "Storage", options: ["512GB", "1TB"] }
]
```

---

## Query Examples

### Get all products
```javascript
db.products.find({})
```

### Get products by category
```javascript
db.products.find({ category: "Elektronik" })
```

### Get products by subcategory
```javascript
db.products.find({ 
  category: "Elektronik",
  subcategory: "Laptop" 
})
```

### Get available products only
```javascript
db.products.find({ 
  status: "available",
  stock: { $gt: 0 }
})
```

### Get products by price range
```javascript
db.products.find({ 
  price: { $gte: 1000000, $lte: 5000000 }
})
```

### Search products by name
```javascript
db.products.find({ 
  name: { $regex: "Gaming", $options: "i" }
})
```

### Get unique categories
```javascript
db.products.distinct("category")
```

### Get subcategories for a category
```javascript
db.products.distinct("subcategory", { category: "Elektronik" })
```

---

## Indexes (Recommended)

```javascript
// Index untuk search by name
db.products.createIndex({ name: "text" })

// Index untuk filter by category
db.products.createIndex({ category: 1 })

// Index untuk filter by subcategory
db.products.createIndex({ subcategory: 1 })

// Index untuk filter by status
db.products.createIndex({ status: 1 })

// Index untuk sort by price
db.products.createIndex({ price: 1 })

// Compound index untuk category + subcategory
db.products.createIndex({ category: 1, subcategory: 1 })
```

---

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Example: Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung Galaxy S24",
    "price": 12000000,
    "category": "Elektronik",
    "subcategory": "Smartphone",
    "description": "Smartphone flagship Samsung",
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

---

## Advantages vs Normalized Structure

### ✅ Denormalized (Current - Recommended)
```javascript
// 1 Query - Fast!
db.products.findOne({ _id: productId })

// Semua data langsung tersedia:
// - name, price, category, subcategory
// - variants dengan options-nya
```

### ❌ Normalized (Tidak Direkomendasikan)
```javascript
// 3 Queries - Slow!
const product = db.products.findOne({ _id: productId })
const category = db.categories.findOne({ _id: product.categoryId })
const variants = db.variants.find({ _id: { $in: product.variantIds }})

// Harus JOIN manual di aplikasi
```

---

## Storage Estimate

### Per Product
- Basic info: ~300 bytes
- Variants (2 variants, 5 options each): ~200 bytes
- **Total per product**: ~500 bytes

### For 1000 Products
- 1000 × 500 bytes = ~500 KB
- Very efficient!

---

## Backup & Restore

### Backup
```bash
mongodump --db anjay-ecommerce --collection products --out ./backup
```

### Restore
```bash
mongorestore --db anjay-ecommerce --collection products ./backup/anjay-ecommerce/products.bson
```

### Export to JSON
```bash
mongoexport --db anjay-ecommerce --collection products --out products.json --pretty
```

---

## Summary

✅ **1 Collection**: Hanya products, simple!
✅ **No Relations**: Semua data embedded, tidak perlu JOIN
✅ **Flexible**: Setiap produk bisa punya variant berbeda
✅ **Fast**: Query langsung, tidak perlu lookup
✅ **Easy**: Mudah di-manage dan di-query
✅ **Scalable**: Bisa handle ribuan produk dengan mudah

**Kesimpulan**: Struktur denormalized ini LEBIH BAIK untuk e-commerce karena:
- Lebih cepat (1 query vs multiple queries)
- Lebih fleksibel (variant bisa beda-beda per produk)
- Lebih mudah di-maintain
- Tidak ada data "baku" yang membatasi
