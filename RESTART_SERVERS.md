# Restart Servers untuk Apply Changes

## Backend sudah diupdate untuk handle custom _id

File yang diupdate:
- `backend/routes/products.js` - Sekarang bisa handle custom string ID seperti "prod_iphone_15_pro_001"

## Steps to Apply Changes:

### 1. Restart Backend Server
```bash
cd backend

# Stop server yang sedang running (Ctrl+C)
# Kemudian start lagi:
npm start
```

Backend sekarang akan jalan di port 5001 dan bisa handle custom ID.

### 2. Restart Frontend (jika belum)
```bash
cd anjay

# Stop server yang sedang running (Ctrl+C)
# Kemudian start lagi:
npm run dev
```

Frontend akan otomatis baca `.env` file dengan `VITE_API_URL=http://localhost:5001/api`

## Test Flow:

1. Buka browser: `http://localhost:5173`
2. Klik salah satu produk di homepage
3. Product detail page akan fetch data dari API menggunakan custom ID
4. Pilih variant yang tersedia
5. Klik "Tambah ke Keranjang"
6. Buka cart untuk lihat item dengan variant yang dipilih

## Expected Result:

✅ Product list menampilkan 6 produk dari MongoDB
✅ Klik produk membuka detail page dengan data lengkap
✅ Variant selector menampilkan semua options
✅ Variant yang tidak tersedia di-disable (abu-abu + strikethrough)
✅ Harga dan stock update sesuai variant yang dipilih
✅ Add to cart berhasil dengan variant yang dipilih
✅ Cart menampilkan item dengan variant tags

## Troubleshooting:

Jika masih error:
1. Check backend console untuk error messages
2. Check browser console (F12) untuk network errors
3. Verify MongoDB connection di backend console
4. Test API endpoint manual: `curl http://localhost:5001/api/products`
