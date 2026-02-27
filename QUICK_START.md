# ⚡ Quick Start Guide

## 🎯 Cara Cepat Mulai Development

### Option 1: Tanpa MongoDB (Menggunakan Data Lokal)

Jika belum setup MongoDB, frontend tetap bisa jalan dengan data lokal:

```bash
cd anjay
npm install
npm run dev
```

Buka browser: `http://localhost:5173`

Website akan menampilkan notifikasi: "Menggunakan data lokal"

---

### Option 2: Dengan MongoDB (Full Stack)

#### Step 1: Setup MongoDB Connection

1. Dapatkan connection string yang benar dari MongoDB Atlas
2. Edit `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster...
   ```

#### Step 2: Install & Seed Backend

```bash
cd backend
npm install
node seed.js
```

#### Step 3: Jalankan Backend

```bash
npm run dev
```

Server: `http://localhost:5000`

#### Step 4: Jalankan Frontend (Terminal Baru)

```bash
cd anjay
npm install
npm run dev
```

Frontend: `http://localhost:5173`

---

## 🚀 Build untuk Production

### Frontend
```bash
cd anjay
npm run build
```

Upload folder `dist/` ke Netlify/Vercel

### Backend
Deploy ke Heroku/Railway/Render dengan environment variables:
- `MONGODB_URI`
- `PORT`
- `DB_NAME`

---

## 📖 Dokumentasi Lengkap

- **MongoDB Setup**: Lihat `MONGODB_SETUP_GUIDE.md`
- **Backend API**: Lihat `backend/README.md`
- **Main README**: Lihat `README.md`

---

## 🆘 Butuh Bantuan?

### Frontend tidak muncul produk?
- Cek console browser (F12)
- Pastikan backend berjalan di port 5000
- Atau biarkan menggunakan data lokal

### Backend error saat seed?
- Connection string salah format
- Lihat `backend/SETUP_MONGODB.md`

### Port sudah digunakan?
```bash
# Ganti port di backend/.env
PORT=3001

# Atau kill process yang menggunakan port
lsof -ti:5000 | xargs kill -9
```
