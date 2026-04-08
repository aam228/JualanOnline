const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// ==========================================
// UTILITY: Cart item ID generation
// ==========================================
function getCartItemId(item) {
  const baseId = item._id || item.id || item.productId;
  return item.sku ? `${baseId}-${item.sku}` : baseId;
}

// ==========================================
// UTILITY: Cart item validation
// ==========================================
function isValidCartItem(item) {
  if (!item || typeof item !== 'object') return false;

  return (
    typeof item._id === 'string' &&
    item._id.trim().length > 0 &&
    typeof item.slug === 'string' &&
    item.slug.trim().length > 0 &&
    typeof item.name === 'string' &&
    item.name.trim().length > 0 &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    typeof item.image === 'string' &&
    typeof item.category === 'string' &&
    typeof item.description === 'string' &&
    typeof item.stock === 'number' &&
    Number.isFinite(item.stock) &&
    item.stock >= 0 &&
    typeof item.quantity === 'number' &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0
  );
}

function toStringOrFallback(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function toNumberOrFallback(value, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeIncomingCartItem(item) {
  if (!item || typeof item !== 'object') return null;

  const productId = toStringOrFallback(item._id, toStringOrFallback(item.id, toStringOrFallback(item.productId)));
  const productName = toStringOrFallback(item.name, 'Untitled Product');

  const normalized = {
    _id: productId,
    slug: toStringOrFallback(item.slug, productId || productName.toLowerCase().replace(/\s+/g, '-')),
    name: productName,
    price: toNumberOrFallback(item.price, 0),
    image: toStringOrFallback(item.image),
    category: toStringOrFallback(item.category),
    description: toStringOrFallback(item.description),
    stock: toNumberOrFallback(item.stock, 0),
    currency: toStringOrFallback(item.currency, 'IDR'),
    quantity: toNumberOrFallback(item.quantity, toNumberOrFallback(item.qty, 1)),
    selectedVariants: item.selectedVariants && typeof item.selectedVariants === 'object' ? item.selectedVariants : undefined,
    sku: toStringOrFallback(item.sku),
  };

  return normalized;
}

// ==========================================
// UTILITY: Normalize cart items (dedup + merge by ID)
// ==========================================
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

// ==========================================
// ENDPOINT: GET /api/cart - Fetch user's cart from MongoDB
// ==========================================
router.get('/', verifyToken, async (req, res) => {
  try {
    // Extract and validate userId from JWT
    const userId = req.user._id;
    if (!userId) {
      console.warn('[CART] ⚠️ GET request: userId not found in token');
      return res.status(400).json({ error: 'Invalid user token: missing userId' });
    }

    console.log(`[CART] GET cart for user:`, userId);

    const db = getDB();
    if (!db) {
      console.error('[CART] ❌ GET: Database not connected');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const cartsCollection = db.collection('carts');

    // Query MongoDB for user's cart
    const cartDoc = await cartsCollection.findOne({ userId: userId });

    if (!cartDoc) {
      console.log(`[CART] ℹ️ GET: No cart found for user (first-time user)`);
      return res.json({
        userId: userId,
        items: [],
        updatedAt: null,
        status: 'new'
      });
    }

    // Validate items in cart document
    const validItems = Array.isArray(cartDoc.items) 
      ? cartDoc.items.filter(item => {
          const valid = isValidCartItem(item);
          if (!valid) {
            console.warn(`[CART] ⚠️ GET: Removing invalid item from DB cart:`, item._id);
          }
          return valid;
        })
      : [];

    console.log(`[CART] ✅ GET: Found cart with ${validItems.length} valid items`);

    res.json({
      userId: userId,
      items: validItems,
      updatedAt: cartDoc.updatedAt || null,
      status: 'existing'
    });
  } catch (error) {
    console.error('[CART] ❌ GET error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to load cart',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// ==========================================
// ENDPOINT: PUT /api/cart - Save/update user's cart
// ==========================================
router.put('/', verifyToken, async (req, res) => {
  try {
    console.log('[CART] PUT raw req.body:', JSON.stringify(req.body));

    // Extract and validate userId from JWT
    const userId = req.user._id;
    if (!userId) {
      console.warn('[CART] ⚠️ PUT request: userId not found in token');
      return res.status(400).json({ error: 'Invalid user token: missing userId' });
    }

    console.log(`[CART] PUT cart for user:`, userId);

    // Validate request body
    const inputItems = Array.isArray(req.body?.items) ? req.body.items : [];
    console.log(`[CART] PUT: Received ${inputItems.length} items from client`);
    console.log('[CART] PUT raw items sample:', JSON.stringify(inputItems[0] || null));

    const normalizedIncomingItems = inputItems
      .map(normalizeIncomingCartItem)
      .filter((item) => item !== null);

    console.log(`[CART] PUT: Normalized incoming items count ${normalizedIncomingItems.length}`);
    console.log('[CART] PUT normalized items sample:', JSON.stringify(normalizedIncomingItems[0] || null));

    // Filter and validate items
    const safeItems = normalizedIncomingItems.filter(item => {
      const valid = isValidCartItem(item);
      if (!valid) {
        console.warn('[CART] ⚠️ PUT: Filtering out invalid item:', item);
      }
      return valid;
    });

    const removedCount = normalizedIncomingItems.length - safeItems.length;
    if (removedCount > 0) {
      console.warn(`[CART] ⚠️ PUT: Removed ${removedCount} invalid items`);
    }

    // Normalize items (dedup)
    const normalizedItems = normalizeCartItems(safeItems);
    console.log(`[CART] PUT: Normalized to ${normalizedItems.length} items after dedup`);

    const db = getDB();
    if (!db) {
      console.error('[CART] ❌ PUT: Database not connected');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const cartsCollection = db.collection('carts');

    // Upsert: update if exists, insert if new
    const result = await cartsCollection.updateOne(
      { userId: userId },
      {
        $set: {
          userId: userId,
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

    const isNew = result.upsertedId !== null && result.upsertedId !== undefined;
    console.log(`[CART] ✅ PUT: Cart ${isNew ? 'created' : 'updated'} successfully (${normalizedItems.length} items)`);

    res.json({
      success: true,
      userId: userId,
      items: normalizedItems,
      savedCount: normalizedItems.length,
      isNew: isNew
    });
  } catch (error) {
    console.error('[CART] ❌ PUT error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to save cart',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// ==========================================
// ENDPOINT: DELETE /api/cart - Clear user's cart
// ==========================================
router.delete('/', verifyToken, async (req, res) => {
  try {
    // Extract and validate userId from JWT
    const userId = req.user._id;
    if (!userId) {
      console.warn('[CART] ⚠️ DELETE request: userId not found in token');
      return res.status(400).json({ error: 'Invalid user token: missing userId' });
    }

    console.log(`[CART] DELETE cart for user:`, userId);

    const db = getDB();
    if (!db) {
      console.error('[CART] ❌ DELETE: Database not connected');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const cartsCollection = db.collection('carts');

    // Clear items but keep cart record with timestamps
    const result = await cartsCollection.updateOne(
      { userId: userId },
      {
        $set: {
          items: [],
          updatedAt: new Date(),
          clearedAt: new Date(),
        },
        $setOnInsert: {
          userId: userId,
          userEmail: req.user.email || '',
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`[CART] ✅ DELETE: Cart cleared successfully`);

    res.json({ 
      success: true, 
      userId: userId,
      items: [],
      message: 'Cart cleared' 
    });
  } catch (error) {
    console.error('[CART] ❌ DELETE error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to clear cart',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

module.exports = router;
