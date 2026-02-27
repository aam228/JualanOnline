# Database Structure - Anjay E-commerce (Final with SKU)

## Database Name
```
anjay-ecommerce
```

## Collection: products

### Purpose
Menyimpan produk dengan sistem SKU (Stock Keeping Unit) untuk setiap kombinasi variant.

---

## Schema Structure

```javascript
{
  _id: ObjectId("..."),
  name: String,                    // Nama produk
  price: Number,                   // Harga base/mulai dari
  category: String,                // Kategori utama
  subcategory: String,             // Sub-kategori
  description: String,             // Deskripsi produk
  icon: String,                    // Emoji icon
  status: String,                  // "available" atau "sold"
  images: [String],                // Array gambar produk
  
  // Variant options yang tersedia untuk produk ini
  variantOptions: {
    Warna: [String],               // Contoh: ["Hitam", "Putih", "Biru"]
    Storage: [String],             // Contoh: ["128GB", "256GB", "512GB"]
    RAM: [String],                 // dll...
  },
  
  // SKU: Setiap kombinasi variant dengan stock & price masing-masing
  skus: [
    {
      sku: String,                 // SKU code unik (contoh: "IP15P-BLK-128")
      variants: {                  // Kombinasi variant spesifik
        Warna: String,             // Contoh: "Hitam"
        Storage: String            // Contoh: "128GB"
      },
      stock: Number,               // Stock untuk kombinasi ini
      price: Number                // Harga untuk kombinasi ini (bisa beda)
    }
  ],
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Example Data

### 1. Smartphone dengan 2 Variants (Warna & Storage)

```javascript
{
  _id: ObjectId("..."),
  name: "iPhone 15 Pro",
  price: 18000000,                 // Harga mulai dari
  category: "Elektronik",
  subcategory: "Smartphone",
  description: "Smartphone flagship dengan chip A17 Pro",
  icon: "📱",
  status: "available",
  images: ["📱", "📱", "📱", "📱"],
  
  // Variant options yang tersedia
  variantOptions: {
    Warna: ["Hitam", "Putih", "Biru"],
    Storage: ["128GB", "256GB", "512GB", "1TB"]
  },
  
  // SKU: Kombinasi spesifik yang tersedia
  skus: [
    // Hitam - semua storage
    {
      sku: "IP15P-BLK-128",
      variants: { Warna: "Hitam", Storage: "128GB" },
      stock: 5,
      price: 18000000
    },
    {
      sku: "IP15P-BLK-256",
      variants: { Warna: "Hitam", Storage: "256GB" },
      stock: 8,
      price: 20000000
    },
    {
      sku: "IP15P-BLK-512",
      variants: { Warna: "Hitam", Storage: "512GB" },
      stock: 3,
      price: 23000000
    },
    {
      sku: "IP15P-BLK-1TB",
      variants: { Warna: "Hitam", Storage: "1TB" },
      stock: 0,              // SOLD OUT
      price: 26000000
    },
    
    // Putih - tidak semua storage tersedia
    {
      sku: "IP15P-WHT-128",
      variants: { Warna: "Putih", Storage: "128GB" },
      stock: 0,              // SOLD OUT
      price: 18000000
    },
    {
      sku: "IP15P-WHT-256",
      variants: { Warna: "Putih", Storage: "256GB" },
      stock: 6,
      price: 20000000
    },
    {
      sku: "IP15P-WHT-512",
      variants: { Warna: "Putih", Storage: "512GB" },
      stock: 4,
      price: 23000000
    },
    // Putih 1TB tidak tersedia
    
    // Biru - hanya storage tertentu
    {
      sku: "IP15P-BLU-256",
      variants: { Warna: "Biru", Storage: "256GB" },
      stock: 10,
      price: 20000000
    },
    {
      sku: "IP15P-BLU-512",
      variants: { Warna: "Biru", Storage: "512GB" },
      stock: 7,
      price: 23000000
    }
    // Biru 128GB dan 1TB tidak tersedia
  ]
}
```

### 2. Laptop dengan 3 Variants (Warna, RAM, Storage)

```javascript
{
  _id: ObjectId("..."),
  name: "MacBook Pro 14 M3",
  price: 28000000,
  category: "Elektronik",
  subcategory: "Laptop",
  description: "Laptop profesional dengan chip M3",
  icon: "💻",
  status: "available",
  images: ["💻", "💻", "💻", "💻"],
  
  variantOptions: {
    Warna: ["Silver", "Space Gray"],
    RAM: ["8GB", "16GB", "32GB"],
    Storage: ["512GB", "1TB"]
  },
  
  skus: [
    // Silver
    {
      sku: "MBP14-SLV-8-512",
      variants: { Warna: "Silver", RAM: "8GB", Storage: "512GB" },
      stock: 5,
      price: 28000000
    },
    {
      sku: "MBP14-SLV-16-512",
      variants: { Warna: "Silver", RAM: "16GB", Storage: "512GB" },
      stock: 8,
      price: 32000000
    },
    {
      sku: "MBP14-SLV-16-1TB",
      variants: { Warna: "Silver", RAM: "16GB", Storage: "1TB" },
      stock: 4,
      price: 36000000
    },
    {
      sku: "MBP14-SLV-32-1TB",
      variants: { Warna: "Silver", RAM: "32GB", Storage: "1TB" },
      stock: 2,
      price: 42000000
    },
    
    // Space Gray - tidak semua kombinasi tersedia
    {
      sku: "MBP14-GRY-8-512",
      variants: { Warna: "Space Gray", RAM: "8GB", Storage: "512GB" },
      stock: 0,              // SOLD OUT
      price: 28000000
    },
    {
      sku: "MBP14-GRY-16-512",
      variants: { Warna: "Space Gray", RAM: "16GB", Storage: "512GB" },
      stock: 6,
      price: 32000000
    },
    {
      sku: "MBP14-GRY-16-1TB",
      variants: { Warna: "Space Gray", RAM: "16GB", Storage: "1TB" },
      stock: 3,
      price: 36000000
    }
    // Space Gray dengan RAM 32GB tidak tersedia
  ]
}
```

### 3. Headphone dengan 1 Variant (Warna saja)

```javascript
{
  _id: ObjectId("..."),
  name: "Sony WH-1000XM5",
  price: 5500000,
  category: "Audio",
  subcategory: "Headphone",
  description: "Headphone noise cancelling terbaik",
  icon: "🎧",
  status: "available",
  images: ["🎧", "🎧", "🎧", "🎧"],
  
  variantOptions: {
    Warna: ["Hitam", "Silver", "Putih"]
  },
  
  skus: [
    {
      sku: "WH1000XM5-BLK",
      variants: { Warna: "Hitam" },
      stock: 15,
      price: 5500000
    },
    {
      sku: "WH1000XM5-SLV",
      variants: { Warna: "Silver" },
      stock: 8,
      price: 5500000
    },
    {
      sku: "WH1000XM5-WHT",
      variants: { Warna: "Putih" },
      stock: 12,
      price: 5500000
    }
  ]
}
```

---

## Key Concepts

### 1. Flexible Combinations
Tidak semua kombinasi variant harus tersedia. Contoh:
- iPhone Biru hanya tersedia di 256GB dan 512GB
- MacBook Space Gray tidak tersedia dengan RAM 32GB
- Ini realistis seperti di toko sungguhan

### 2. Different Prices per SKU
Setiap SKU bisa punya harga berbeda:
- iPhone 128GB: Rp 18.000.000
- iPhone 256GB: Rp 20.000.000
- iPhone 512GB: Rp 23.000.000

### 3. Individual Stock per SKU
Stock ditrack per kombinasi spesifik:
- iPhone Hitam 128GB: 5 unit
- iPhone Hitam 256GB: 8 units
- iPhone Putih 128GB: 0 units (SOLD OUT)

### 4. SKU Code
Format: `PRODUCT-VARIANT1-VARIANT2-VARIANT3`
- `IP15P-BLK-128` = iPhone 15 Pro - Black - 128GB
- `MBP14-SLV-16-1TB` = MacBook Pro 14 - Silver - 16GB - 1TB

---

## Query Examples

### Get product with all SKUs
```javascript
db.products.findOne({ name: "iPhone 15 Pro" })
```

### Get available SKUs only (stock > 0)
```javascript
db.products.aggregate([
  { $match: { name: "iPhone 15 Pro" } },
  { $project: {
      name: 1,
      skus: {
        $filter: {
          input: "$skus",
          as: "sku",
          cond: { $gt: ["$$sku.stock", 0] }
        }
      }
    }
  }
])
```

### Get specific SKU
```javascript
db.products.findOne(
  { "skus.sku": "IP15P-BLK-128" },
  { "skus.$": 1, name: 1, category: 1 }
)
```

### Get products by variant option
```javascript
// Produk yang punya warna Hitam
db.products.find({
  "variantOptions.Warna": "Hitam"
})
```

### Check if specific combination available
```javascript
db.products.findOne({
  name: "iPhone 15 Pro",
  skus: {
    $elemMatch: {
      "variants.Warna": "Hitam",
      "variants.Storage": "256GB",
      stock: { $gt: 0 }
    }
  }
})
```

### Get total stock for a product
```javascript
db.products.aggregate([
  { $match: { name: "iPhone 15 Pro" } },
  { $project: {
      name: 1,
      totalStock: { $sum: "$skus.stock" }
    }
  }
])
```

---

## Frontend Usage

### 1. Display Product
```javascript
// Show base price
price: product.price  // "Mulai dari Rp 18.000.000"

// Show variant options
variantOptions: {
  Warna: ["Hitam", "Putih", "Biru"],
  Storage: ["128GB", "256GB", "512GB", "1TB"]
}
```

### 2. User Selects Variants
```javascript
selectedVariants = {
  Warna: "Hitam",
  Storage: "256GB"
}

// Find matching SKU
const sku = product.skus.find(s => 
  s.variants.Warna === "Hitam" &&
  s.variants.Storage === "256GB"
)

// Show specific price & stock
price: sku.price        // Rp 20.000.000
stock: sku.stock        // 8 units
available: sku.stock > 0  // true
```

### 3. Add to Cart
```javascript
{
  productId: product._id,
  sku: "IP15P-BLK-256",
  name: "iPhone 15 Pro",
  variants: { Warna: "Hitam", Storage: "256GB" },
  price: 20000000,
  quantity: 1
}
```

---

## Default Products (10)

1. **iPhone 15 Pro** - 9 SKUs (3 warna × berbagai storage)
2. **Samsung Galaxy S24 Ultra** - 6 SKUs
3. **MacBook Pro 14 M3** - 7 SKUs (2 warna × berbagai RAM/Storage)
4. **Sony WH-1000XM5** - 3 SKUs (3 warna)
5. **Apple Watch Series 9** - 6 SKUs (2 ukuran × 3 warna)
6. **Keychron K8 Pro** - 5 SKUs (3 switch × 2 backlight)
7. **Logitech MX Master 3S** - 3 SKUs (3 warna)
8. **iPad Air M2** - 5 SKUs (3 warna × berbagai storage)
9. **AirPods Pro 2** - 2 SKUs (2 tipe connector)
10. **JBL Flip 6** - 3 SKUs (3 warna)

**Total: 49 SKUs**

---

## Advantages

✅ **Realistic**: Seperti toko sungguhan, tidak semua kombinasi tersedia
✅ **Flexible**: Setiap produk bisa punya variant berbeda
✅ **Accurate Stock**: Stock per kombinasi spesifik
✅ **Dynamic Pricing**: Harga bisa berbeda per SKU
✅ **Scalable**: Mudah tambah/hapus SKU
✅ **Simple Query**: Semua data dalam 1 document

---

## Summary

Struktur ini menggunakan **SKU system** dimana:
- Setiap kombinasi variant = 1 SKU
- Setiap SKU punya stock & price sendiri
- Tidak semua kombinasi harus tersedia (realistis!)
- Frontend tinggal match user selection dengan SKU yang tersedia
