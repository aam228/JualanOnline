# SKU-Based Inventory System Implementation

## Overview
Frontend sekarang sudah terintegrasi dengan backend MongoDB yang menggunakan sistem SKU untuk tracking stock per variant combination.

## What Changed

### 1. Product Detail Page (`ProductDetailPage.tsx`)
- Fetch data dari API menggunakan `productAPI.getById()`
- Menampilkan variant selector dengan disable state untuk kombinasi yang tidak tersedia
- Mencari matching SKU berdasarkan variant yang dipilih user
- Menampilkan harga dan stock dari SKU yang dipilih
- Tombol "Tambah ke Keranjang" disabled jika SKU tidak tersedia atau stock habis

### 2. Cart Context (`CartContext.tsx`)
- Update interface `CartItem` untuk include `sku` field
- Cart item ID sekarang berdasarkan kombinasi `_id` + `sku` (bukan hanya `_id`)
- Ini memungkinkan produk yang sama dengan variant berbeda masuk sebagai item terpisah di cart

### 3. Cart Component (`Cart.tsx`)
- Update untuk handle cart item ID yang baru (product ID + SKU)
- Menampilkan selected variants sebagai tags di setiap cart item

### 4. Styling (`ProductDetailPage.css`)
- Added `.variant-option.disabled` untuk variant yang tidak tersedia
- Added `.stock-warning` untuk peringatan "Pilih varian terlebih dahulu"
- Added `.product-brand` untuk menampilkan brand
- Added `.price-range-hint` untuk range harga
- Added `.product-loading` untuk loading state

## How It Works

### Variant Selection Flow
1. User membuka product detail page
2. System fetch product data dari API
3. Variant options di-initialize dengan nilai pertama dari setiap variant
4. System mencari matching SKU berdasarkan variant yang dipilih
5. Harga dan stock ditampilkan dari SKU yang match
6. Jika user ganti variant, system cari ulang matching SKU
7. Variant yang tidak punya matching SKU akan disabled (abu-abu + strikethrough)

### Add to Cart Flow
1. User pilih variant yang diinginkan
2. System validasi SKU tersedia dan stock > 0
3. Jika valid, product ditambahkan ke cart dengan info:
   - Product ID
   - SKU code
   - Selected variants
   - Price dari SKU
   - Stock dari SKU
4. Di cart, item dengan SKU berbeda dianggap sebagai item terpisah

## Example Data Structure

### Product from API
```json
{
  "_id": "prod_iphone_15_pro_001",
  "name": "iPhone 15 Pro",
  "variantOptions": [
    { "name": "Warna", "values": ["Hitam", "Putih", "Biru"] },
    { "name": "Storage", "values": ["128GB", "256GB", "512GB", "1TB"] }
  ],
  "skus": [
    {
      "sku": "IP15P-BLK-256",
      "isActive": true,
      "variants": { "Warna": "Hitam", "Storage": "256GB" },
      "stock": 8,
      "price": 20000000
    }
  ]
}
```

### Cart Item
```json
{
  "_id": "prod_iphone_15_pro_001",
  "sku": "IP15P-BLK-256",
  "name": "iPhone 15 Pro",
  "price": 20000000,
  "selectedVariants": {
    "Warna": "Hitam",
    "Storage": "256GB"
  },
  "quantity": 1
}
```

## Testing Checklist

- [x] Product list menampilkan data dari MongoDB
- [x] Product detail page fetch data dari API
- [x] Variant selector menampilkan semua options
- [x] Variant yang tidak tersedia di-disable
- [x] Harga update sesuai SKU yang dipilih
- [x] Stock update sesuai SKU yang dipilih
- [x] Add to cart dengan variant yang berbeda membuat item terpisah
- [x] Cart menampilkan selected variants
- [x] Quantity update works per cart item (product + SKU combination)

## Next Steps (Optional)
- [ ] Add image gallery per variant (jika ada)
- [ ] Add stock notification untuk variant yang habis
- [ ] Add "Notify me" button untuk out of stock items
- [ ] Add price comparison untuk different variants
- [ ] Add filter by availability di product list
