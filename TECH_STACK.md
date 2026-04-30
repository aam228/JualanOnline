# Tech Stack - JualanOnline

Dokumentasi lengkap teknologi yang digunakan dalam proyek JualanOnline untuk pengembangan platform e-commerce second-hand luxury streetwear.

---

## 1. **React 19** - Frontend Framework
**Tujuan:** Pengembangan antarmuka frontend yang interaktif dan bertipe kuat

### Fitur Utama:
- **Component-Based Architecture**: Membangun UI yang modular dan reusable
- **TypeScript Integration**: Type safety untuk mengurangi bugs dan meningkatkan maintainability
- **React Router v7**: Navigasi dan routing untuk multi-page application
- **React Hooks**: State management dan side effects handling
- **React Context API**: Global state management untuk authentication dan cart

### Komponen Kunci:
- `ProductList.tsx` - Daftar produk dengan pagination
- `ProductDetail.tsx` - Detail produk dengan galeri gambar
- `Cart.tsx` - Keranjang belanja dengan persistensi
- `AdminProductForm.tsx` - Form untuk menambah/edit produk
- `ProtectedRoute.tsx` - Route protection untuk admin

### Dependencies:
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.13.1"
}
```

---

## 2. **Tailwind CSS** - Styling Framework
**Tujuan:** Penataan tampilan antarmuka yang responsif dan konsisten

### Fitur Utama:
- **Utility-First CSS**: Styling langsung di JSX dengan class names
- **Responsive Design**: Mobile-first approach dengan breakpoints
- **Dark Mode Support**: Built-in dark mode capabilities
- **PostCSS Integration**: Advanced CSS processing dengan nesting support

### Konfigurasi:
- `tailwind.config.js` - Customization tema dan breakpoints
- `postcss.config.js` - PostCSS plugins (autoprefixer, nesting)
- `App.css` - Global styles dan custom utilities

### Dependencies:
```json
{
  "tailwindcss": "^3.3.3",
  "@tailwindcss/postcss": "^4.2.2",
  "@tailwindcss/vite": "^4.2.2",
  "postcss": "^8.5.8",
  "autoprefixer": "^10.4.27",
  "postcss-nesting": "^14.0.0"
}
```

### Komponen UI:
- Responsive grid layouts untuk product showcase
- Mobile navigation dengan hamburger menu
- Responsive forms untuk admin panel
- Flexible card components untuk product display

---

## 3. **Express.js** - Backend Framework
**Tujuan:** Pengembangan layanan backend dan RESTful API

### Fitur Utama:
- **RESTful API**: Endpoint untuk products, users, orders, dan payments
- **Middleware System**: Authentication, CORS, error handling
- **Request Validation**: Input validation dengan Zod
- **File Upload**: Multer untuk upload gambar produk dan flaw photos

### API Endpoints:
- `GET /api/products` - Daftar produk dengan filter
- `GET /api/products/:id` - Detail produk
- `POST /api/products` - Tambah produk (admin)
- `PUT /api/products/:id` - Edit produk (admin)
- `DELETE /api/products/:id` - Hapus produk (admin)
- `POST /api/auth/register` - Registrasi user
- `POST /api/auth/login` - Login user
- `POST /api/orders` - Buat order
- `POST /api/payments/stripe` - Proses pembayaran Stripe
- `POST /api/payments/paypal` - Proses pembayaran PayPal

### Middleware:
- `auth.js` - JWT authentication dan authorization
- CORS handling untuk frontend communication
- Error handling dan logging

### Dependencies:
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "multer": "^2.1.1",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.1",
  "zod": "^4.3.6"
}
```

---

## 4. **Prisma + PostgreSQL** - Database & ORM
**Tujuan:** Sistem basis data NoSQL dengan ORM untuk pengelolaan skema data yang terstruktur

### Fitur Utama:
- **Type-Safe Database Access**: Auto-generated types dari schema
- **Schema Management**: Migrations untuk version control database
- **Relationships**: One-to-many relations (Product → Images, Flaws)
- **Query Builder**: Intuitive API untuk database queries

### Data Models:
```prisma
Product
├── id (UUID)
├── name, brand, category
├── price, originalPrice, currency
├── condition (1-10 scale)
├── size, color, material, year
├── measurements (chest, length, shoulder, sleeve)
├── authenticity, sku, stock
├── shipping info (method, weight, origin, eta)
├── SEO fields (title, description, slug)
├── relationships:
│   ├── flaws[] (One-to-Many)
│   └── images[] (One-to-Many)
├── timestamps (createdAt, updatedAt)

Flaw
├── id (UUID)
├── productId (Foreign Key)
├── description, severity
├── photoUrl

Image
├── id (UUID)
├── productId (Foreign Key)
├── url, tag, order
```

### Fitur Database:
- **Unique Constraints**: SKU dan SEO slug harus unik
- **Timestamps**: Automatic createdAt dan updatedAt
- **Relationships**: Cascade delete untuk flaws dan images
- **Indexing**: Optimized queries untuk product lookups

### Setup:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
node seed.js
```

### Dependencies:
```json
{
  "mongodb": "^6.3.0",
  "@prisma/client": "latest"
}
```

---

## 5. **Stripe & PayPal** - Payment Gateway
**Tujuan:** Payment gateway dengan mekanisme webhook untuk notifikasi event transaksi secara real-time

### Stripe Integration:
- **Payment Processing**: Secure card payments
- **Webhook Handling**: Real-time payment status updates
- **React Integration**: `@stripe/react-stripe-js` untuk frontend
- **Payment Methods**: Support multiple payment methods

### PayPal Integration:
- **Express Checkout**: Quick payment flow
- **Webhook Notifications**: Order status updates
- **React Integration**: `@paypal/react-paypal-js` untuk frontend

### Fitur Keamanan:
- **Webhook Verification**: Validasi signature untuk webhook events
- **Environment Variables**: Sensitive keys di `.env`
- **PCI Compliance**: Tidak menyimpan card data di server

### Payment Services:
- `stripeService.js` - Stripe payment processing
- `paypalService.js` - PayPal payment processing
- `paymentService.js` - Unified payment interface

### Webhook Events:
- `payment_intent.succeeded` - Pembayaran berhasil
- `payment_intent.payment_failed` - Pembayaran gagal
- `charge.refunded` - Refund processed

### Dependencies:
```json
{
  "stripe": "^21.0.1",
  "@stripe/react-stripe-js": "^6.1.0",
  "@stripe/stripe-js": "^9.0.1",
  "@paypal/react-paypal-js": "^9.1.0"
}
```

---

## Development Tools

### Frontend:
- **Vite**: Fast build tool dan dev server
- **TypeScript**: Type safety
- **ESLint**: Code quality
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Backend:
- **Nodemon**: Auto-restart server on changes
- **Dotenv**: Environment variable management

### Build & Deployment:
- **Vite Build**: Optimized production bundle
- **Vercel**: Backend deployment (vercel.json configured)

---

## Project Structure

```
JualanOnline/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin components
│   │   │   ├── ui/             # Reusable UI components
│   │   │   └── *.tsx           # Page components
│   │   ├── context/            # React Context (Auth, Cart)
│   │   ├── pages/              # Page components
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # Entry point
│   ├── public/                 # Static assets
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── config/                 # Database config
│   ├── middleware/             # Auth middleware
│   ├── payments/               # Payment services
│   ├── prisma/                 # Database schema
│   ├── routes/                 # API routes
│   ├── uploads/                # Uploaded files
│   ├── server.js               # Express server
│   ├── seed.js                 # Database seeding
│   ├── package.json
│   └── .env                    # Environment variables
│
└── Documentation files
```

---

## Environment Variables

### Frontend (.env.local):
```
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_PAYPAL_CLIENT_ID=...
```

### Backend (.env):
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
NODE_ENV=development
PORT=5000
```

---

## Getting Started

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup:
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

---

## Key Features Implemented

✅ Product catalog dengan filter dan pagination
✅ Product detail dengan galeri gambar
✅ Shopping cart dengan persistensi
✅ User authentication (register/login)
✅ Admin panel untuk product management
✅ Image upload untuk produk dan flaw photos
✅ Stripe & PayPal payment integration
✅ Responsive design untuk mobile dan desktop
✅ SEO optimization (slug, meta tags)
✅ Product condition rating dan measurements

---

## Performance Optimizations

- **Image Optimization**: Lazy loading untuk product images
- **Code Splitting**: Route-based code splitting dengan React Router
- **Caching**: Browser caching untuk static assets
- **Database Indexing**: Optimized queries dengan Prisma
- **API Pagination**: Limit results untuk better performance

---

## Security Measures

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt untuk password security
- **CORS Configuration**: Restricted cross-origin requests
- **Input Validation**: Zod schema validation
- **Environment Variables**: Sensitive data protection
- **Webhook Verification**: Stripe & PayPal webhook validation

