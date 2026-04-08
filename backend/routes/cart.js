const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

function getCartItemId(item) {
  return item.sku ? `${item._id}-${item.sku}` : item._id;
}

function isValidCartItem(item) {
  if (!item || typeof item !== 'object') return false;

  return (
    typeof item._id === 'string' &&
    typeof item.slug === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    typeof item.image === 'string' &&
    typeof item.category === 'string' &&
    typeof item.description === 'string' &&
    typeof item.stock === 'number' &&
    Number.isFinite(item.stock) &&
    typeof item.quantity === 'number' &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0
  );
}

function normalizeCartItems(items) {
  const mergedById = new Map();

  for (const item of items) {
    const itemId = getCartItemId(item);
    const existing = mergedById.get(itemId);

    if (existing) {
      mergedById.set(itemId, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
      continue;
    }

    mergedById.set(itemId, item);
  }

  return Array.from(mergedById.values());
}

router.get('/', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const cartsCollection = db.collection('carts');

    const cartDoc = await cartsCollection.findOne({ userId: req.user._id });

    res.json({
      userId: req.user._id,
      items: Array.isArray(cartDoc?.items) ? cartDoc.items : [],
      updatedAt: cartDoc?.updatedAt || null,
    });
  } catch (error) {
    console.error('Get cart error:', error.message);
    res.status(500).json({ error: 'Failed to load cart' });
  }
});

router.put('/', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const cartsCollection = db.collection('carts');

    const inputItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const safeItems = inputItems.filter(isValidCartItem);
    const normalizedItems = normalizeCartItems(safeItems);

    await cartsCollection.updateOne(
      { userId: req.user._id },
      {
        $set: {
          userId: req.user._id,
          userEmail: req.user.email || '',
          items: normalizedItems,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({
      success: true,
      items: normalizedItems,
    });
  } catch (error) {
    console.error('Save cart error:', error.message);
    res.status(500).json({ error: 'Failed to save cart' });
  }
});

router.delete('/', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const cartsCollection = db.collection('carts');

    await cartsCollection.updateOne(
      { userId: req.user._id },
      {
        $set: {
          items: [],
          updatedAt: new Date(),
        },
        $setOnInsert: {
          userId: req.user._id,
          userEmail: req.user.email || '',
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({ success: true, items: [] });
  } catch (error) {
    console.error('Clear cart error:', error.message);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
