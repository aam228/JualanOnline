# Image Upload Setup untuk MongoDB

## Option 1: Simpan URL External (Current - Paling Simple)

Sekarang kamu pakai URL dari Unsplash/Discord. Ini paling simple tapi bergantung pada external service.

```javascript
// Di seed.js atau saat create product
images: [
  {
    url: "https://images.unsplash.com/photo-xxx",
    alt: "iPhone 15 Pro",
    isPrimary: true
  }
]
```

**Pros:**
- Simple, tidak perlu setup upload
- Database tetap kecil
- Fast loading (CDN)

**Cons:**
- Bergantung pada external service
- Link bisa expired (Discord CDN)

---

## Option 2: Upload ke Server (Recommended untuk Production)

### Setup:

1. **Install dependencies:**
```bash
cd backend
npm install multer
```

2. **Create upload folder:**
```bash
mkdir -p public/uploads/products
```

3. **Create upload route:**

```javascript
// backend/routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});

// Upload single image
router.post('/single', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.json({ 
      message: 'Image uploaded successfully',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple images
router.post('/multiple', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const imageUrls = req.files.map(file => ({
      url: `/uploads/products/${file.filename}`,
      filename: file.filename
    }));
    
    res.json({ 
      message: 'Images uploaded successfully',
      images: imageUrls
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

4. **Update server.js:**

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const productRoutes = require('./routes/products');
const uploadRoutes = require('./routes/upload');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

5. **Simpan di MongoDB:**

```javascript
// Setelah upload, simpan URL ke MongoDB
const product = {
  _id: "prod_iphone_15_pro_001",
  name: "iPhone 15 Pro",
  images: [
    {
      url: "http://localhost:5001/uploads/products/product-1234567890.jpg",
      alt: "iPhone 15 Pro",
      isPrimary: true
    }
  ],
  // ... rest of product data
};
```

---

## Option 3: Cloudinary (Best for Production)

1. **Install:**
```bash
npm install cloudinary multer
```

2. **Setup:**
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload to Cloudinary
router.post('/cloudinary', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'products',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    });
    
    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Quick Fix untuk Sekarang

Kalau mau cepat, pakai placeholder service atau simpan gambar di folder `public` frontend:

1. **Taruh gambar di `anjay/public/images/products/`**
2. **Update seed.js:**

```javascript
images: [
  {
    url: "/images/products/iphone-15-pro.jpg",
    alt: "iPhone 15 Pro",
    isPrimary: true
  }
]
```

3. **Frontend akan load dari:** `http://localhost:5173/images/products/iphone-15-pro.jpg`

---

## Recommendation

Untuk development: **Option 2** (Upload ke server)
Untuk production: **Option 3** (Cloudinary)

Mau saya buatkan setup lengkap untuk option mana?
