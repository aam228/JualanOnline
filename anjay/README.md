# TechMart - Modern E-Commerce Marketplace

E-commerce marketplace modern dengan desain minimalis ala Tokopedia 2026. Dibangun dengan React, TypeScript, dan React Router.

## 🎨 Design System

- **Primary Color**: #00A550 (Hijau Tokopedia)
- **Hover State**: #00D16A
- **Accent**: #FF6B35 (Orange untuk diskon)
- **Background**: #FFFFFF (Putih murni)
- **Text**: #000000 (Hitam)
- **Gray**: #6B7280
- **Footer**: #2C3E50

## ✨ Fitur Utama

### 🏪 Katalog Produk
- Grid responsif dengan card design modern
- Shadow hijau subtle pada hover
- Border radius 12px
- Badge kategori floating

### 🔍 Pencarian & Filter
- Search bar prominent
- Filter kategori dengan pill design
- Real-time filtering

### 📄 Halaman Detail Produk
- Layout 2 kolom (gambar & info)
- Breadcrumb navigation
- Rating & review display
- Sticky image section
- Related products
- Professional product description

### 🛒 Keranjang Belanja
- Sidebar slide dari kanan
- Quantity controls
- Real-time total calculation
- Badge notifikasi di header

### 📱 Mobile-First Design
- Fully responsive
- Touch-optimized
- Fast loading
- Grid 2 kolom di mobile

## 🚀 Teknologi

- React 19
- TypeScript
- React Router DOM
- Context API
- CSS3 Modern
- Inter Font
- Vite

## 📦 Instalasi

```bash
cd anjay
npm install
```

## 💻 Development

```bash
npm run dev
```

Buka `http://localhost:5173`

## 🏗️ Build Production

```bash
npm run build
```

Output ada di folder `dist/`

## 🌐 Deploy ke Netlify

1. Build project: `npm run build`
2. Buka https://app.netlify.com/drop
3. Drag folder `anjay/dist`
4. Done! ✅

File `public/_redirects` sudah dikonfigurasi untuk routing SPA.

## 📁 Struktur Project

```
anjay/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Navbar fixed
│   │   ├── ProductList.tsx     # Grid produk + filter
│   │   ├── ProductCard.tsx     # Card produk
│   │   ├── Cart.tsx            # Sidebar keranjang
│   │   └── Footer.tsx          # Footer
│   ├── pages/
│   │   ├── HomePage.tsx        # Halaman utama
│   │   └── ProductDetailPage.tsx # Detail produk
│   ├── context/
│   │   └── CartContext.tsx     # State management
│   ├── data/
│   │   └── products.ts         # Data produk
│   ├── types/
│   │   └── Product.ts          # TypeScript types
│   └── App.tsx                 # Router setup
├── public/
│   └── _redirects              # Netlify routing
└── dist/                       # Build output
```

## 🎯 Fitur yang Bisa Ditambahkan

- [ ] Payment gateway integration
- [ ] User authentication
- [ ] Wishlist
- [ ] Product reviews & ratings
- [ ] Order tracking
- [ ] Admin dashboard
- [ ] Backend API
- [ ] Database integration
- [ ] Image upload
- [ ] Email notifications

## 🛠️ Customization

### Tambah Produk

Edit `src/data/products.ts`:

```typescript
{
  id: 10,
  name: 'Nama Produk',
  price: 1000000,
  image: '🎮',
  category: 'Kategori',
  description: 'Deskripsi lengkap produk',
  stock: 10
}
```

### Ubah Warna

Edit `src/App.css`:

```css
:root {
  --primary: #00A550;
  --primary-hover: #00D16A;
  --secondary: #FF6B35;
}
```

## 📱 Responsive Breakpoints

- Desktop: > 992px
- Tablet: 768px - 992px
- Mobile: < 768px
- Small Mobile: < 576px

## 🎨 Typography

- Font: Inter
- Body: 15px
- Headings: 16px - 32px
- Line Height: 1.6

## 📄 License

Open source - bebas digunakan dan dimodifikasi

---

Dibuat dengan ❤️ menggunakan React & TypeScript
