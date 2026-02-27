# 🚀 Setup MongoDB untuk Anjay E-commerce

## ⚠️ PENTING: Connection String Issue

Connection string yang diberikan memiliki format yang tidak valid. Ikuti langkah berikut untuk mendapatkan connection string yang benar.

## 📋 Langkah Setup

### 1. Dapatkan Connection String yang Benar

1. Login ke **MongoDB Atlas**: https://cloud.mongodb.com
2. Pilih cluster Anda → Klik tombol **"Connect"**
3. Pilih **"Connect your application"**
4. Copy connection string (format: `mongodb+srv://username:password@cluster...`)
5. Replace `<username>` dan `<password>` dengan credentials Anda

**Format yang benar:**
```
mongodb+srv://adamwildan:PASSWORD_ANDA@cluster0.0oaajah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**⚠️ Jika password mengandung karakter khusus** (@, :, /, dll), encode dulu:
- Contoh: `P@ssw0rd!` → `P%40ssw0rd%21`
- Gunakan URL Encoder online

### 2. Update File .env

Edit file `backend/.env`:
```env
MONGODB_URI=mongodb+srv://adamwildan:PASSWORD_ANDA@cluster0.0oaajah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
DB_NAME=anjay_shop
```

### 3. Install Dependencies Backend

```bash
cd backend
npm install
```

### 4. Seed Database (Isi Data Awal)

```bash
node seed.js
```

**Output yang diharapkan:**
```
✅ Successfully connected to MongoDB!
🗑️  Cleared existing products
✅ Inserted 9 products

📦 Products in database:
  💻 Laptop Gaming ROG - Rp 15.000.000
  📱 iPhone 15 Pro Max - Rp 20.000.000
  ...
```

### 5. Jalankan Backend Server

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

Server akan berjalan di: `http://localhost:5000`

### 6. Jalankan Frontend

Di terminal baru:
```bash
cd anjay
npm install
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

## 🧪 Test API

### Test dengan curl:
```bash
# Get all products
curl http://localhost:5000/api/products

# Get single product
curl http://localhost:5000/api/products/PRODUCT_ID
```

### Test dengan browser:
Buka: `http://localhost:5000/api/products`

## 🔧 Troubleshooting

### Error: Authentication failed
- ✅ Pastikan username dan password benar
- ✅ Cek di MongoDB Atlas → Database Access

### Error: IP not whitelisted
- ✅ Buka MongoDB Atlas → Network Access
- ✅ Tambahkan IP atau gunakan `0.0.0.0/0` (allow all)

### Error: ENOTFOUND
- ✅ Connection string salah format
- ✅ Pastikan tidak ada spasi
- ✅ Encode password jika ada karakter khusus

### Backend tidak berjalan
- ✅ Pastikan MongoDB connection string sudah benar
- ✅ Jalankan `node seed.js` untuk test koneksi

### Frontend menampilkan "Menggunakan data lokal"
- ✅ Backend belum berjalan atau connection gagal
- ✅ Jalankan backend server dulu
- ✅ Cek console browser untuk error

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

## 🎯 Fitur

- ✅ CRUD operations untuk products
- ✅ MongoDB Atlas integration
- ✅ RESTful API
- ✅ Fallback ke data lokal jika backend offline
- ✅ CORS enabled
- ✅ Error handling

## 📝 Notes

- Frontend akan otomatis menggunakan data lokal jika backend tidak tersedia
- Setelah backend berjalan, refresh halaman untuk load data dari MongoDB
- Data di MongoDB bisa di-manage via API endpoints
