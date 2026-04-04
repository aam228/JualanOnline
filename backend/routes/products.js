
const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET single product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const db = getDB();
    const slug = req.params.slug;
    console.log('[GET /products/slug/:slug] Cari slug:', slug);
    const product = await db.collection('products').findOne({ slug });
    console.log('[GET /products/slug/:slug] Hasil query:', product);
    if (!product) {
      console.warn('[GET /products/slug/:slug] Produk tidak ditemukan:', slug);
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('[GET /products/slug/:slug] ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Admin role check middleware (placeholder) ---
function requireAdmin(req, res, next) {
  // TODO: Implement real authentication/authorization
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin access required' });
}

// --- Input validation and sanitization (placeholder) ---
function validateProductInput(req, res, next) {
  // TODO: Implement full validation as per requirements
  // Example: check required fields
  const required = [
    'name', 'brand', 'category', 'price', 'condition',
    'size', 'color', 'authenticity', 'chest', 'length',
    'images', 'shippingMethod', 'shippingWeight'
  ];
  for (const field of required) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }
  next();
}

// --- Rate limiting (placeholder) ---
function rateLimit(req, res, next) {
  // TODO: Implement real rate limiting (e.g., 10 products/hour per admin)
  next();
}

// GET all products
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection('products').find({}).toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    // Try to find by custom string _id first, then by ObjectId
    let product = await db.collection('products').findOne({ 
      _id: req.params.id 
    });
    
    // If not found and id looks like ObjectId, try with ObjectId
    if (!product && ObjectId.isValid(req.params.id)) {
      product = await db.collection('products').findOne({ 
        _id: new ObjectId(req.params.id) 
      });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new product
router.post('/', requireAdmin, rateLimit, validateProductInput, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('products').insertOne(req.body);
    res.status(201).json({ 
      message: 'Product created', 
      id: result.insertedId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products/validate - server-side validation endpoint
router.post('/validate', (req, res) => {
  const data = req.body;
  // Example: repeat required field checks (expand as needed)
  const required = [
    'name', 'brand', 'category', 'price', 'condition',
    'size', 'color', 'authenticity', 'chest', 'length',
    'images', 'shippingMethod', 'shippingWeight'
  ];
  for (const field of required) {
    if (!data[field]) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }
  // TODO: Add more advanced validation as needed
  res.json({ valid: true });
});

// PUT update product
router.put('/:id', requireAdmin, validateProductInput, async (req, res) => {
  try {
    const db = getDB();
    // Try custom string _id first
    let result = await db.collection('products').updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    // If not found and id looks like ObjectId, try with ObjectId
    if (result.matchedCount === 0 && ObjectId.isValid(req.params.id)) {
      result = await db.collection('products').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
    }
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    // Try custom string _id first
    let result = await db.collection('products').deleteOne({ 
      _id: req.params.id 
    });
    
    // If not found and id looks like ObjectId, try with ObjectId
    if (result.deletedCount === 0 && ObjectId.isValid(req.params.id)) {
      result = await db.collection('products').deleteOne({ 
        _id: new ObjectId(req.params.id) 
      });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
