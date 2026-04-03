// Image upload API for product images (multi-image, validation, processing hooks)
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Storage config (local, replace with S3/Cloudinary as needed)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});

// File filter: type, size
function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) return cb(new Error('Invalid file type'), false);
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /api/upload/images (multi-image)
router.post('/images', upload.array('images', 10), (req, res) => {
  // TODO: Add image processing (crop, rotate, compress, tag)
  const files = req.files.map(f => ({
    url: `/uploads/${f.filename}`,
    originalName: f.originalname,
    size: f.size,
    mimetype: f.mimetype
  }));
  res.status(201).json({ files });
});

module.exports = router;
