# Database Structure - Anjay E-commerce

## Database Name
```
anjay-ecommerce
```

## Collections Overview

Database ini memiliki **3 collections utama**:
1. **categories** - Menyimpan kategori dan sub-kategori produk
2. **variants** - Menyimpan tipe variant dan pilihan-pilihannya
3. **products** - Menyimpan data produk dengan referensi ke kategori dan variants

---

## 1. Categories Collection

### Purpose
Menyimpan kategori utama dan sub-kategori untuk mengorganisir produk.

### Schema
```javascript
{
  _id: ObjectId("..."),                    // MongoDB auto-generated ID
  name: String,                            // Nama kategori (contoh: "Elektronik")
  icon: String,                            // Emoji icon (contoh: "💻")
  subcategories: [                         // Array sub-kategori
    {
      id: String,                          // ID unik sub-kategori
      name: String,                        // Nama sub-kategori (contoh: "Laptop")
      createdAt: Date                      // Tanggal dibuat (optional)
    }
  ],
  createdAt: Date,                         // Timestamp dibuat
  updatedAt: Date                          // Timestamp terakhir diupdate
}
```

### Example Data
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789012345"),
  name: "Elektronik",
  icon: "💻",
  subcategories: [
    { id: "1", name: "Laptop" },
    { id: "2", name: "Smartphone" },
    { id: "3", name: "Tablet" },
    { id: "4", name: "Monitor" },
    { id: "5", name: "Kamera" }
  ],
  createdAt: ISODate("2024-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:00:00.000Z")
}
```

### Default Categories (5)
1. **Elektronik** 💻
   - Laptop, Smartphone, Tablet, Monitor, Kamera

2. **Audio** 🎧
   - Headphone, Earphone, Speaker, Microphone

3. **Wearable** ⌚
   - Smartwatch, Fitness Tracker, Smart Glasses

4. **Aksesoris** 🖱️
   - Keyboard, Mouse, Webcam, Charger, Cable, Case & Cover

5. **Gaming** 🎮
   - Console, Controller, Gaming Chair, Gaming Desk

### Indexes
```javascript
db.categories.createIndex({ name: 1 })
```

---

## 2. Variants Collection

### Purpose
Menyimpan tipe variant (seperti Warna, Ukuran, RAM) dan pilihan-pilihannya yang bisa digunakan oleh berbagai produk.

### Schema
```javascript
{
  _id: ObjectId("..."),                    // MongoDB auto-generated ID
  name: String,                            // Nama tipe variant (contoh: "Warna")
  options: [String],                       // Array pilihan (contoh: ["Hitam", "Putih", "Biru"])
  createdAt: Date,                         // Timestamp dibuat
  updatedAt: Date                          // Timestamp terakhir diupdate
}
```

### Example Data
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789012346"),
  name: "Warna",
  options: ["Hitam", "Putih", "Biru", "Merah", "Silver", "Gold", "Hijau", "Pink"],
  createdAt: ISODate("2024-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:00:00.000Z")
}
```

### Default Variant Types (10)

1. **Warna**
   - Hitam, Putih, Biru, Merah, Silver, Gold, Hijau, Pink

2. **Ukuran**
   - S, M, L, XL, XXL, 40mm, 44mm, 46mm, 24 inch, 27 inch, 32 inch

3. **RAM**
   - 4GB, 8GB, 16GB, 32GB, 64GB

4. **Storage**
   - 64GB, 128GB, 256GB, 512GB, 1TB, 2TB, 256GB SSD, 512GB SSD, 1TB SSD

5. **Resolusi**
   - 720p, 1080p, 2K, 4K, 8K

6. **Refresh Rate**
   - 60Hz, 75Hz, 120Hz, 144Hz, 165Hz, 240Hz

7. **Switch**
   - Blue, Red, Brown, Black, Silver

8. **Layout**
   - Full Size, TKL, 60%, 65%, 75%

9. **DPI**
   - 800, 1600, 3200, 6400, 8000, 12000, 16000

10. **Kapasitas Baterai**
    - 3000mAh, 4000mAh, 5000mAh, 6000mAh

### Indexes
```javascript
db.variants.createIndex({ name: 1 })
```

---

## 3. Products Collection

### Purpose
Menyimpan data produk lengkap dengan kategori, sub-kategori, dan variants.

### Schema
```javascript
{
  _id: ObjectId("..."),                    // MongoDB auto-generated ID
  name: String,                            // Nama produk
  price: Number,                           // Harga produk (dalam Rupiah)
  category: String,                        // Kategori utama (referensi ke categories.name)
  subcategory: String,                     // Sub-kategori (referensi ke categories.subcategories.name)
  description: String,                     // Deskripsi produk
  icon: String,                            // Emoji icon produk
  stock: Number,                           // Jumlah stok tersedia
  status: String,                          // Status: "available" atau "sold"
  variants: [                              // Array variants untuk produk ini
    {
      name: String,                        // Nama variant (contoh: "Warna")
      options: [String]                    // Pilihan untuk variant ini (contoh: ["Hitam", "Putih"])
    }
  ],
  createdAt: Date,                         // Timestamp dibuat
  updatedAt: Date                          // Timestamp terakhir diupdate
}
```

### Example Data
```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6789012347"),
  name: "Laptop Gaming ROG",
  price: 15000000,
  category: "Elektronik",
  subcategory: "Laptop",
  description: "Laptop gaming dengan spesifikasi tinggi untuk gaming dan produktivitas",
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

### Default Products (9)

1. **Laptop Gaming ROG** - Elektronik/Laptop
   - Variants: RAM (8GB, 16GB, 32GB), Storage (256GB, 512GB, 1TB SSD)
   - Price: Rp 15.000.000
   - Stock: 10

2. **iPhone 15 Pro Max** - Elektronik/Smartphone
   - Variants: Warna (Hitam, Putih, Biru), Storage (128GB, 256GB, 512GB, 1TB)
   - Price: Rp 20.000.000
   - Stock: 0 (SOLD)

3. **Sony WH-1000XM5** - Audio/Headphone
   - Variants: Warna (Hitam, Silver, Putih)
   - Price: Rp 5.000.000
   - Stock: 20

4. **Apple Watch Series 9** - Wearable/Smartwatch
   - Variants: Ukuran (40mm, 44mm, 46mm), Warna (Hitam, Silver, Gold)
   - Price: Rp 7.000.000
   - Stock: 18

5. **Mechanical Keyboard RGB** - Aksesoris/Keyboard
   - Variants: Switch (Blue, Red, Brown), Layout (Full Size, TKL, 60%)
   - Price: Rp 1.500.000
   - Stock: 30

6. **Gaming Mouse Logitech** - Aksesoris/Mouse
   - Variants: DPI (8000, 12000, 16000)
   - Price: Rp 800.000
   - Stock: 0 (SOLD)

7. **Monitor 4K Gaming** - Elektronik/Monitor
   - Variants: Ukuran (24", 27", 32"), Refresh Rate (60Hz, 144Hz, 240Hz)
   - Price: Rp 6.500.000
   - Stock: 12

8. **Webcam HD Pro** - Aksesoris/Webcam
   - Variants: Resolusi (720p, 1080p, 4K)
   - Price: Rp 1.200.000
   - Stock: 25

9. **Bluetooth Speaker JBL** - Audio/Speaker
   - Variants: Warna (Hitam, Biru, Merah), Ukuran (S, M, L)
   - Price: Rp 1.800.000
   - Stock: 15

### Indexes
```javascript
db.products.createIndex({ name: 1 })
db.products.createIndex({ category: 1 })
db.products.createIndex({ subcategory: 1 })
db.products.createIndex({ status: 1 })
db.products.createIndex({ price: 1 })
```

---

## Relationships

### Category → Product (One-to-Many)
```
categories.name → products.category
categories.subcategories.name → products.subcategory
```

### Variant → Product (Many-to-Many)
```
variants.name → products.variants.name
variants.options → products.variants.options (subset)
```

**Note:** Products menyimpan copy dari variant options yang relevan, bukan referensi langsung. Ini memberikan fleksibilitas untuk setiap produk memiliki subset options yang berbeda.

---

## Data Flow

### 1. Menambah Produk Baru
```
1. Pilih category dari categories collection
2. Pilih subcategory dari category.subcategories
3. Pilih variant types dari variants collection
4. Untuk setiap variant, pilih options yang relevan
5. Simpan produk dengan data lengkap
```

### 2. Filter Produk by Category
```
1. Query: db.products.find({ category: "Elektronik" })
2. Atau by subcategory: db.products.find({ subcategory: "Laptop" })
```

### 3. Menambah Variant Baru
```
1. Tambah variant type di variants collection
2. Variant ini bisa langsung digunakan untuk produk baru
3. Produk lama tidak terpengaruh (karena copy, bukan referensi)
```

---

## Storage Estimates

### Per Document Size
- **Category**: ~500 bytes (dengan 5 subcategories)
- **Variant**: ~200 bytes (dengan 8 options)
- **Product**: ~800 bytes (dengan 2 variants)

### Total for Default Data
- **Categories**: 5 documents × 500 bytes = ~2.5 KB
- **Variants**: 10 documents × 200 bytes = ~2 KB
- **Products**: 9 documents × 800 bytes = ~7.2 KB
- **Total**: ~12 KB

### Projected for 1000 Products
- **Categories**: ~2.5 KB (tetap)
- **Variants**: ~2 KB (tetap)
- **Products**: 1000 × 800 bytes = ~800 KB
- **Total**: ~805 KB

---

## Query Examples

### Get all products in a category
```javascript
db.products.find({ category: "Elektronik" })
```

### Get products with specific variant
```javascript
db.products.find({ 
  "variants.name": "Warna",
  "variants.options": "Hitam"
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

### Get category with all its products
```javascript
// First get category
const category = db.categories.findOne({ name: "Elektronik" })

// Then get products
const products = db.products.find({ category: category.name })
```

---

## Backup & Restore

### Backup
```bash
mongodump --db anjay-ecommerce --out ./backup
```

### Restore
```bash
mongorestore --db anjay-ecommerce ./backup/anjay-ecommerce
```

### Export to JSON
```bash
mongoexport --db anjay-ecommerce --collection products --out products.json
mongoexport --db anjay-ecommerce --collection categories --out categories.json
mongoexport --db anjay-ecommerce --collection variants --out variants.json
```

---

## Summary

✅ **3 Collections**: categories, variants, products
✅ **Flexible Structure**: Products dapat memiliki variant yang berbeda-beda
✅ **Scalable**: Mudah menambah kategori, sub-kategori, dan variant baru
✅ **Normalized**: Categories dan Variants terpisah untuk reusability
✅ **Denormalized**: Products menyimpan copy data untuk performance
