const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET all products (admin view)
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const products = await db.collection('products')
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('products').countDocuments();
    
    res.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product (admin view)
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    let product = await db.collection('products').findOne({ _id: req.params.id });
    
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

// POST create new product (Vintage/Bekas Type)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const {
      name,
      brand,
      price,
      condition,
      description,
      images,
      measurements,
      defects,
      shipping,
      tags,
      isPublished
    } = req.body;
    
    // Validation
    if (!name || !price) {
      return res.status(400).json({ error: 'Missing required fields: name, price' });
    }
    
    // Auto-generate slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    // Check slug uniqueness
    const existingSlug = await db.collection('products').findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({ error: 'Product with this name already exists' });
    }
    
    const product = {
      _id: slug,
      slug,
      name,
      brand: brand || '',
      type: 'vintage',
      price: price,
      currency: 'IDR',
      condition: condition || 'used',
      description: description || '',
      images: images || [],
      measurements: measurements || {},
      defects: defects || [],
      shipping: shipping || { method: 'Indonesian Post', estimatedDays: '3-5' },
      tags: tags || [],
      stock: 1,
      isPublished: isPublished || false,
      status: 'available',
      ratings: { average: 0, count: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('products').insertOne(product);
    
    res.status(201).json({
      message: 'Product created successfully',
      id: result.insertedId,
      product
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update product
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const updateData = req.body;
    updateData.updatedAt = new Date();
    
    let result = await db.collection('products').updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0 && ObjectId.isValid(req.params.id)) {
      result = await db.collection('products').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData }
      );
    }
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Fetch updated product
    const updatedProduct = await db.collection('products').findOne({ _id: req.params.id });
    
    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE product
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    let result = await db.collection('products').deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0 && ObjectId.isValid(req.params.id)) {
      result = await db.collection('products').deleteOne({ 
        _id: new ObjectId(req.params.id) 
      });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
