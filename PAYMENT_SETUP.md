# Payment Integration Setup Guide

## Overview
Aplikasi e-commerce ini menggunakan Stripe sebagai payment gateway. Untuk menjalankan sistem pembayaran, Anda perlu mengonfigurasi API keys di file `.env` baik di backend maupun frontend.

## Backend Setup (.env)

Copy atau rename `.env.example` ke `.env` di folder `backend/`, kemudian isi dengan data Stripe Anda:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=jualan_online

# Express Server
PORT=5000

# Stripe Keys
STRIPE_SECRET=sk_test_XXXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXX (optional)

# RajaOngkir (for shipping)
RAJAONGKIR_API_KEY=your_rajaongkir_key
RAJAONGKIR_BASE_URL=https://api.rajaongkir.com/starter
STORE_ORIGIN_CITY=501
```

### Stripe Keys Explained:
- **STRIPE_SECRET**: Secret key dari Stripe (dimulai dengan `sk_test_` atau `sk_live_`)
- **STRIPE_WEBHOOK_SECRET**: Optional, untuk webhook handling (dimulai dengan `whsec_`)

### Cara mendapatkan Stripe Keys:
1. Daftar di https://stripe.com
2. Login ke Dashboard Stripe
3. Go to Developers > API Keys
4. Copy Secret Key (dimulai dengan `sk_`)
5. Untuk webhook secret, buat endpoint di Webhooks section

## Frontend Setup (.env atau .env.local)

Di folder `frontend/`, buat atau edit `.env.local`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Stripe Public Key
VITE_STRIPE_PUBLIC_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXX
```

### Stripe Public Key:
- Dapatkan dari Developers > API Keys (Public Key yang dimulai dengan `pk_test_` atau `pk_live_`)
- **JANGAN SHARE SECRET KEY ke frontend, hanya gunakan PUBLIC KEY**

## File Structure

```
JualanOnline/
├── backend/
│   ├── .env              ← Backend environment variables
│   ├── routes/
│   │   └── payments.js   ← API routes untuk payment
│   └── server.js
│
├── frontend/
│   ├── .env.local        ← Frontend environment variables
│   ├── src/
│   │   ├── pages/
│   │   │   ├── PaymentPage.tsx
│   │   │   ├── PaymentSuccessPage.tsx
│   │   │   └── CheckoutPage.tsx
│   │   └── services/
│   │       └── payment.ts
│   └── package.json
│
└── PAYMENT_SETUP.md      ← File ini
```

## Payment Flow

### Frontend Flow:
1. User menambahkan produk ke keranjang → `Cart`
2. User checkout → `CheckoutPage` (Step 1: Shipping, Step 2: Courier, Step 3: Summary)
3. User klik "Bayar" → Navigate ke `PaymentPage`
4. `PaymentPage` membuat Payment Intent di backend
5. Stripe Checkout Element menampilkan form kartu kredit
6. User enter card details & klik "Bayar"
7. Frontend mengirim payment ke Stripe
8. Jika berhasil → Navigate ke `PaymentSuccessPage`
9. `PaymentSuccessPage` fetch status dari backend

### Backend Flow:
1. POST `/api/payments/create-payment-intent`
   - Create Stripe PaymentIntent
   - Save order ke MongoDB
   - Return clientSecret

2. POST `/api/payments/confirm-payment`
   - Verify payment status
   - Update order status di MongoDB
   - Return confirmation

3. GET `/api/payments/payment-status/:paymentIntentId`
   - Fetch order details
   - Check payment status

4. POST `/api/payments/webhook`
   - Listen untuk Stripe events (payment_intent.succeeded, payment_intent.payment_failed)
   - Update order status otomatis

## Environment Variables Reference

| Variable | Type | Example | Description |
|----------|------|---------|-------------|
| `STRIPE_SECRET` | Backend | `sk_test_123...` | Secret API key dari Stripe |
| `STRIPE_WEBHOOK_SECRET` | Backend | `whsec_123...` | Webhook signing secret (optional) |
| `VITE_STRIPE_PUBLIC_KEY` | Frontend | `pk_test_123...` | Public API key dari Stripe |
| `VITE_API_URL` | Frontend | `http://localhost:5000/api` | Backend API endpoint |
| `MONGODB_URI` | Backend | `mongodb+srv://...` | MongoDB connection string |
| `DB_NAME` | Backend | `jualan_online` | Database name |
| `PORT` | Backend | `5000` | Server port |

## Running the Application

### Development

1. **Backend**:
```bash
cd backend
npm install
npm run dev  # Requires .env file
```

2. **Frontend**:
```bash
cd frontend
npm install
npm run dev  # Requires .env.local file
```

3. **Database**:
Make sure MongoDB is running (local atau cloud)

### Testing Payment

**Use Stripe Test Cards**:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- Result: Payment akan berhasil

- Card: `4000 0000 0000 0002`
- Any expiry, any CVC
- Result: Payment akan gagal

## Database Schema

Orders akan disimpan di MongoDB dengan struktur:

```javascript
{
  _id: ObjectId,
  orderId: "ORDER-1234567890",
  stripePaymentIntentId: "pi_xxxxx",
  amount: 100000,
  currency: "idr",
  status: "completed" | "pending" | "failed",
  customerEmail: "customer@example.com",
  customerName: "John Doe",
  paymentStatus: "paid" | "failed",
  failureReason: null | "Card declined",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## API Endpoints

### Create Payment Intent
```
POST /api/payments/create-payment-intent
Content-Type: application/json

{
  "amount": 100000,           // Dalam IDR
  "currency": "idr",
  "customerEmail": "user@example.com",
  "customerName": "John Doe",
  "orderId": "ORDER-123"      // Optional
}

Response: {
  "clientSecret": "pi_xxxxx_secret_yyyyy",
  "paymentIntentId": "pi_xxxxx"
}
```

### Confirm Payment
```
POST /api/payments/confirm-payment
Content-Type: application/json

{
  "paymentIntentId": "pi_xxxxx"
}

Response: {
  "status": "succeeded",
  "clientSecret": "pi_xxxxx_secret_yyyyy"
}
```

### Get Payment Status
```
GET /api/payments/payment-status/pi_xxxxx

Response: {
  "status": "succeeded",
  "amount": 100000,
  "currency": "idr",
  "order": {
    "_id": ObjectId,
    "orderId": "ORDER-123",
    "stripePaymentIntentId": "pi_xxxxx",
    ...
  }
}
```

## Troubleshooting

### Error: "STRIPE_SECRET is not defined"
- Check that `.env` file exists di folder `backend/`
- Verify `STRIPE_SECRET=sk_test_...` adalah benar
- Restart server setelah menambah `.env`

### Error: "VITE_STRIPE_PUBLIC_KEY is not defined"
- Check bahwa `.env.local` exists di folder `frontend/`
- Verify `VITE_STRIPE_PUBLIC_KEY=pk_test_...` adalah benar
- Perlu restart dev server: `npm run dev`

### Payment Intent creation fails
- Verify Stripe keys adalah valid
- Check network tab di browser developer tools
- Ensure MongoDB connection adalah aktif
- Check backend logs di terminal

### Payment succeeded but order tidak terupdate
- Check MongoDB connection
- Verify `MONGODB_URI` dan `DB_NAME` di `.env`
- Check browser console untuk errors

### Webhook tidak triggered
- Optional untuk development
- Install Stripe CLI untuk local webhook testing
- Set `STRIPE_WEBHOOK_SECRET` jika menggunakan webhook

## Security Notes

⚠️ **IMPORTANT**:
- JANGAN commit `.env` atau `.env.local` ke git
- JANGAN expose `STRIPE_SECRET` di frontend/client-side code
- Use `VITE_` prefix hanya untuk PUBLIC keys di frontend
- Selalu verify payment di backend, jangan percaya client-side konfirmasi

## Production Deployment

Saat deploy ke production:

1. Update environment variables dengan **live keys** (bukan test keys)
   - `sk_live_...` untuk backend
   - `pk_live_...` untuk frontend

2. Update `VITE_API_URL` ke production backend URL

3. Set `STRIPE_WEBHOOK_SECRET` untuk production webhooks

4. Gunakan production MongoDB URL

5. Test thoroughly dengan live keys di staging environment dulu

## Next Steps

1. ✅ Buat Stripe account (https://stripe.com)
2. ✅ Copy Stripe keys ke `.env` files
3. ✅ Run backend: `npm run dev` (dari backend folder)
4. ✅ Run frontend: `npm run dev` (dari frontend folder)
5. ✅ Test dengan Stripe test cards
6. ✅ Monitor payments di Stripe Dashboard
7. ✅ Cek orders di MongoDB

## Support

Untuk bantuan lebih lanjut:
- Stripe Documentation: https://stripe.com/docs
- Stripe Test Cards: https://stripe.com/docs/testing
- Contact Stripe Support: https://support.stripe.com
