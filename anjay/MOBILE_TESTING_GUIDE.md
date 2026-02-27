# Mobile Testing Guide

## Cara Test Responsive Design

### 1. Chrome DevTools (Recommended)
```bash
# Jalankan development server
cd anjay
npm run dev
```

Kemudian:
1. Buka Chrome DevTools (F12)
2. Klik icon "Toggle device toolbar" (Ctrl+Shift+M)
3. Pilih device presets atau custom dimensions:
   - iPhone SE: 375 x 667
   - iPhone 12 Pro: 390 x 844
   - Samsung Galaxy S20: 360 x 800
   - iPad: 768 x 1024
   - Desktop: 1920 x 1080

### 2. Test di Real Device
```bash
# Cari IP address komputer kamu
# Windows:
ipconfig

# Mac/Linux:
ifconfig

# Jalankan dev server dengan host
npm run dev -- --host

# Akses dari mobile browser:
# http://[YOUR_IP]:5173
```

### 3. Fitur yang Harus Ditest

#### Mobile (< 480px)
- ✅ Bottom navigation muncul
- ✅ Sidebar hilang
- ✅ Header compact (search + 2 icon buttons)
- ✅ Product grid 2 kolom dengan spacing kecil
- ✅ Cart full width
- ✅ Product detail single column
- ✅ Footer single column

#### Tablet (768px - 992px)
- ✅ Sidebar icon-only (70px)
- ✅ Product grid 2 kolom
- ✅ Header dengan user status
- ✅ Footer 2 kolom

#### Desktop (> 992px)
- ✅ Sidebar full dengan labels (220px)
- ✅ Product grid 3 kolom
- ✅ Full header dengan semua elements
- ✅ Footer 4 kolom

### 4. Touch Interactions
Test di real device:
- Tap buttons (minimum 44px target)
- Scroll smoothness
- Cart quantity buttons
- Product card tap
- Navigation transitions

### 5. Common Issues to Check
- [ ] Text tidak terlalu kecil untuk dibaca
- [ ] Buttons mudah di-tap (tidak terlalu kecil)
- [ ] Images tidak overflow
- [ ] Horizontal scroll tidak muncul
- [ ] Input fields tidak menyebabkan zoom
- [ ] Bottom nav tidak overlap dengan content

### 6. Performance Check
```bash
# Build production
npm run build

# Preview production build
npm run preview
```

Test:
- Page load speed
- Scroll performance
- Animation smoothness
- Image loading

### 7. Browser Testing
Test di:
- Chrome Mobile
- Safari iOS
- Samsung Internet
- Firefox Mobile

## Breakpoint Reference
```css
/* Small Mobile */
@media (max-width: 360px) { }

/* Mobile */
@media (max-width: 480px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop */
@media (max-width: 992px) { }

/* Large Desktop */
@media (max-width: 1400px) { }
```

## Tips
1. Test dengan slow 3G network di DevTools
2. Test dengan touch simulation enabled
3. Check console untuk errors
4. Verify all images load properly
5. Test cart functionality di mobile
6. Test navigation between pages

## Known Optimizations
- Product images menggunakan emoji (instant load)
- CSS Grid untuk efficient layouts
- Transform animations (GPU accelerated)
- Minimal JavaScript untuk fast interaction
- Touch-optimized tap targets
