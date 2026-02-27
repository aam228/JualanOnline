# Setup MongoDB Connection

## ⚠️ Connection String Issue

Connection string yang diberikan memiliki format yang tidak valid:
```
mongodb+srv://adamwildan:@Adamwildan@cluster0.0oaajah.mongodb.net/?appName=Cluster0
```

## ✅ Cara Mendapatkan Connection String yang Benar

1. **Login ke MongoDB Atlas** (https://cloud.mongodb.com)

2. **Pilih Cluster** → Klik tombol "Connect"

3. **Pilih "Connect your application"**

4. **Copy connection string** yang diberikan, formatnya seperti:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Replace `<username>` dan `<password>`** dengan credentials Anda:
   - Username: `adamwildan`
   - Password: Password database Anda (bukan `@Adamwildan`)

## 📝 Format Connection String yang Benar

```
mongodb+srv://adamwildan:PASSWORD_ANDA@cluster0.0oaajah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**PENTING:** 
- Jika password mengandung karakter khusus (@, :, /, dll), harus di-encode
- Contoh: password `P@ssw0rd!` menjadi `P%40ssw0rd%21`
- Gunakan tool online "URL Encoder" untuk encode password

## 🔧 Update File .env

Setelah mendapat connection string yang benar, update file `backend/.env`:

```env
MONGODB_URI=mongodb+srv://adamwildan:PASSWORD_ANDA@cluster0.0oaajah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
DB_NAME=anjay_shop
```

## 🧪 Test Connection

Setelah update .env, test koneksi dengan:

```bash
node seed.js
```

Jika berhasil, akan muncul:
```
✅ Successfully connected to MongoDB!
🗑️  Cleared existing products
✅ Inserted 9 products
```

## 🆘 Troubleshooting

### Error: Authentication failed
- Pastikan username dan password benar
- Cek di MongoDB Atlas → Database Access

### Error: IP not whitelisted
- Buka MongoDB Atlas → Network Access
- Tambahkan IP address atau gunakan `0.0.0.0/0` (allow all)

### Error: ENOTFOUND
- Connection string salah format
- Pastikan tidak ada spasi atau karakter aneh
- Pastikan password sudah di-encode jika ada karakter khusus
