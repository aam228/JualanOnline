const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

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
router.post('/', async (req, res) => {
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

// PUT update product
router.put('/:id', async (req, res) => {
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
