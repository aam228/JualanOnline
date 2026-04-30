const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { createPayment, capturePayment, getPayment } = require('../payments/paymentService');
const {
  isStripeConfigured,
  retrieveStripeSession,
  retrievePaymentIntent,
  createPaymentIntent,
  constructWebhookEvent,
} = require('../payments/stripeService');
const { isPaypalConfigured } = require('../payments/paypalService');
const { ObjectId } = require('mongodb');

const DEFAULT_CHECKOUT_ORIGIN = 'https://jualan-online.vercel.app';

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getRequestBody(req) {
  return req?.body && typeof req.body === 'object' ? req.body : {};
}

function getCheckoutOrigin(req) {
  return (
    req?.headers?.origin ||
    req?.headers?.referer?.replace(/\/$/, '') ||
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    DEFAULT_CHECKOUT_ORIGIN
  );
}

function getFrontendBaseUrl(req) {
  let frontendBaseUrl = process.env.FRONTEND_BASE_URL || DEFAULT_CHECKOUT_ORIGIN;
  const origin = req?.headers?.origin;
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    frontendBaseUrl = origin;
  }
  return frontendBaseUrl;
}

function toFiniteNumber(value) {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function isZeroDecimalCurrency(currency) {
  return ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'].includes(
    String(currency || '').toLowerCase()
  );
}

function normalizeStripeUnitAmount(value, currency) {
  const numericValue = toFiniteNumber(value);
  if (numericValue === null || numericValue <= 0) {
    return null;
  }

  if (isZeroDecimalCurrency(currency)) {
    return Math.round(numericValue);
  }

  if (!Number.isInteger(numericValue)) {
    return Math.round(numericValue * 100);
  }

  return Math.round(numericValue);
}

function clampQuantity(requestedQuantity, stockQuantity) {
  const numericRequested = Math.floor(toFiniteNumber(requestedQuantity) || 1);
  const safeRequested = numericRequested > 0 ? numericRequested : 1;
  const numericStock = Math.floor(toFiniteNumber(stockQuantity) || 0);

  if (numericStock <= 0) {
    return 0;
  }

  return Math.min(safeRequested, numericStock);
}

async function resolveProductDoc(productsCollection, item) {
  const queries = [];
  const itemId = item?._id || item?.id || item?.productId;

  if (item?.slug) {
    queries.push({ slug: item.slug });
  }

  if (itemId) {
    queries.push({ _id: itemId });
    if (typeof itemId === 'string' && ObjectId.isValid(itemId)) {
      queries.push({ _id: new ObjectId(itemId) });
    }
  }

  for (const query of queries) {
    const productDoc = await productsCollection.findOne(query);
    if (productDoc) {
      return productDoc;
    }
  }

  return null;
}

function buildStripeLineItemName(item, productDoc) {
  return productDoc?.name || item?.name || item?.slug || item?.productSlug || item?._id || 'Product';
}

async function buildStripeCheckoutLineItems({ items, currency, shippingCost = 0, productsCollection }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError('Invalid checkout payload');
  }

  const normalizedCurrency = String(currency || '').toLowerCase();
  if (!normalizedCurrency) {
    throw createHttpError('Invalid checkout payload');
  }

  const line_items = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      throw createHttpError('Invalid checkout payload');
    }

    const productDoc = await resolveProductDoc(productsCollection, item);
    const stockSource = toFiniteNumber(productDoc?.stock);
    const fallbackStock = toFiniteNumber(item.stock);
    const availableStock = stockSource !== null ? stockSource : fallbackStock;

    if (availableStock !== null && availableStock <= 0) {
      throw createHttpError(`Product ${buildStripeLineItemName(item, productDoc)} is out of stock`);
    }

    const quantity = clampQuantity(item.quantity, availableStock);
    if (!quantity) {
      throw createHttpError(`Invalid quantity for ${buildStripeLineItemName(item, productDoc)}`);
    }

    const priceSource = toFiniteNumber(productDoc?.price) ?? toFiniteNumber(item.price) ?? toFiniteNumber(productDoc?.priceRange?.min);
    const unit_amount = normalizeStripeUnitAmount(priceSource, normalizedCurrency);
    if (!unit_amount || !Number.isInteger(unit_amount)) {
      throw createHttpError(`Invalid price for ${buildStripeLineItemName(item, productDoc)}`);
    }

    line_items.push({
      price_data: {
        currency: normalizedCurrency,
        product_data: {
          name: buildStripeLineItemName(item, productDoc),
        },
        unit_amount,
      },
      quantity,
    });
  }

  const normalizedShipping = toFiniteNumber(shippingCost);
  if (normalizedShipping !== null && normalizedShipping > 0) {
    const shippingUnitAmount = normalizeStripeUnitAmount(normalizedShipping, normalizedCurrency);
    if (shippingUnitAmount && Number.isInteger(shippingUnitAmount)) {
      line_items.push({
        price_data: {
          currency: normalizedCurrency,
          product_data: {
            name: 'Shipping',
          },
          unit_amount: shippingUnitAmount,
        },
        quantity: 1,
      });
    }
  }

  return line_items;
}

function getFrontendBaseUrl(req) {
  let frontendBaseUrl = process.env.FRONTEND_BASE_URL || DEFAULT_CHECKOUT_ORIGIN;
  const origin = req?.headers?.origin;
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    frontendBaseUrl = origin;
  }
  return frontendBaseUrl;
}

function normalizeOrderId(orderId) {
  return orderId || `ORDER-${Date.now()}`;
}

function extractPaypalCaptureId(captureResponse) {
  const purchaseUnit = captureResponse?.purchase_units?.[0];
  const capture = purchaseUnit?.payments?.captures?.[0];
  return capture?.id || null;
}

function extractPaypalAmount(captureResponse) {
  const purchaseUnit = captureResponse?.purchase_units?.[0];
  const amountValue = purchaseUnit?.amount?.value || purchaseUnit?.payments?.captures?.[0]?.amount?.value || '0';
  const amountNumber = Number(amountValue);
  return Number.isFinite(amountNumber) ? amountNumber : 0;
}

async function upsertDraftOrder({
  orderId,
  amount,
  currency,
  customerEmail,
  customerName,
  items,
  shippingAddress,
  shippingRegion,
  shippingCost,
  paymentProvider,
}) {
  const db = getDB();
  const ordersCollection = db.collection('orders');

  await ordersCollection.updateOne(
    { orderId },
    {
      $setOnInsert: {
        orderId,
        customerEmail: customerEmail || '',
        customerName,
        amount,
        currency,
        status: 'pending',
        paymentStatus: 'pending',
        payment_status: 'pending',
        orderSource: `${paymentProvider}-checkout`,
        items: items || [],
        shippingAddress: shippingAddress || {},
        shippingRegion: shippingRegion || '',
        shippingCost: shippingCost || 0,
        createdAt: new Date(),
      },
      $set: {
        updatedAt: new Date(),
        paymentProvider,
        payment_provider: paymentProvider,
      },
    },
    { upsert: true }
  );
}

// CORS preflight handler for all /payments routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req?.headers?.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

async function handleStripeCheckoutSession(req, res) {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ error: 'Stripe not initialized' });
    }

    const body = getRequestBody(req);
    const {
      amount,
      currency = 'usd',
      customerEmail,
      customerName,
      orderId,
      items = [],
      shippingAddress = {},
      shippingRegion = '',
      shippingCost = 0,
    } = body;

    const numericAmount = toFiniteNumber(amount);
    if (numericAmount === null || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid checkout payload' });
    }

    if (!customerName || !shippingAddress?.address1 || !shippingAddress?.city || !shippingAddress?.country) {
      return res.status(400).json({ error: 'Invalid checkout payload' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid checkout payload' });
    }

    const currencyValue = String(currency || '').trim();
    if (!currencyValue) {
      return res.status(400).json({ error: 'Invalid checkout payload' });
    }

    const normalizedOrderId = normalizeOrderId(orderId);
    const origin = getCheckoutOrigin(req);
    const frontendBaseUrl = getFrontendBaseUrl(req);
    const productSlug = body.productSlug || '';
    const currentUrl = body.currentUrl || '';
    const db = getDB();
    const productsCollection = db.collection('products');

    const line_items = await buildStripeCheckoutLineItems({
      items,
      currency: currencyValue,
      shippingCost,
      productsCollection,
    });

    if (!line_items.length) {
      return res.status(400).json({ error: 'Invalid checkout payload' });
    }

    console.log('Checkout origin:', origin);
    console.log('Checkout payload:', body);
    console.log('Line items:', line_items);

    await upsertDraftOrder({
      orderId: normalizedOrderId,
      amount: numericAmount,
      currency: currencyValue.toUpperCase(),
      customerEmail,
      customerName,
      items,
      shippingAddress,
      shippingRegion,
      shippingCost,
      paymentProvider: 'stripe',
    });

    const session = await createPayment('stripe', {
      amount: numericAmount,
      currency: currencyValue.toLowerCase(),
      customerEmail,
      customerName,
      orderId: normalizedOrderId,
      frontendBaseUrl,
      currentUrl,
      productSlug,
      shippingRegion,
      lineItems: line_items,
      successUrl: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancelUrl: `${origin}/checkout`,
    });

    const ordersCollection = db.collection('orders');
    await ordersCollection.updateOne(
      { orderId: normalizedOrderId },
      {
        $set: {
          stripeSessionId: session.id,
          stripe_session_id: session.id,
          updatedAt: new Date(),
        },
      }
    );

    return res.json({
      id: session.id,
      url: session.url,
      provider: 'stripe',
      orderId: normalizedOrderId,
    });
  } catch (error) {
    console.error('Create checkout session error:', error.message);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to create Stripe checkout session',
    });
  }
}

// Stripe Checkout Session endpoint (legacy path)
router.post('/create-checkout-session', handleStripeCheckoutSession);

// Stripe Checkout Session endpoint (new path)
router.post('/stripe/create-session', handleStripeCheckoutSession);

// PayPal create order
router.post('/paypal/create-order', async (req, res) => {
  try {
    if (!isPaypalConfigured()) {
      return res.status(500).json({ error: 'PayPal not initialized' });
    }

    const body = getRequestBody(req);
    const {
      amount,
      currency = 'USD',
      customerEmail,
      customerName,
      orderId,
      items = [],
      shippingAddress = {},
      shippingRegion = '',
      shippingCost = 0,
      currentUrl = '',
    } = body;

    const numericAmount = toFiniteNumber(amount);
    if (numericAmount === null || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid checkout payload' });
    }

    if (!customerName || !shippingAddress?.address1 || !shippingAddress?.city || !shippingAddress?.country) {
      return res.status(400).json({ error: 'Invalid checkout payload' });
    }

    const normalizedOrderId = normalizeOrderId(orderId);
    const frontendBaseUrl = getFrontendBaseUrl(req);

    await upsertDraftOrder({
      orderId: normalizedOrderId,
      amount: numericAmount,
      currency: String(currency).toUpperCase(),
      customerEmail,
      customerName,
      items,
      shippingAddress,
      shippingRegion,
      shippingCost,
      paymentProvider: 'paypal',
    });

    const paypalOrder = await createPayment('paypal', {
      amount: numericAmount,
      currency: String(currency).toUpperCase(),
      customerEmail,
      customerName,
      orderId: normalizedOrderId,
      frontendBaseUrl,
      currentUrl,
    });

    if (!paypalOrder?.id) {
      return res.status(502).json({
        error: 'PayPal order creation returned an invalid response',
        message: 'Failed to create PayPal order',
      });
    }

    const db = getDB();
    const ordersCollection = db.collection('orders');
    await ordersCollection.updateOne(
      { orderId: normalizedOrderId },
      {
        $set: {
          paypalOrderId: paypalOrder.id,
          paypal_order_id: paypalOrder.id,
          paymentProvider: 'paypal',
          payment_provider: 'paypal',
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      provider: 'paypal',
      orderID: paypalOrder.id,
      id: paypalOrder.id,
      status: paypalOrder.status,
      localOrderId: normalizedOrderId,
      links: paypalOrder.links || [],
    });
  } catch (error) {
    console.error('PayPal create order error:', error.message);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to create PayPal order',
      message: 'Failed to create PayPal order',
    });
  }
});

// PayPal capture order
router.post('/paypal/capture-order', async (req, res) => {
  try {
    if (!isPaypalConfigured()) {
      return res.status(500).json({ error: 'PayPal not initialized' });
    }

    const { orderID, paypalOrderId, orderId } = getRequestBody(req);
    const targetPaypalOrderId = orderID || paypalOrderId;

    if (!targetPaypalOrderId) {
      return res.status(400).json({ error: 'PayPal order ID required' });
    }

    const captureResponse = await capturePayment('paypal', {
      paypalOrderId: targetPaypalOrderId,
    });

    const captureStatus = captureResponse?.status;
    const isPaid = captureStatus === 'COMPLETED';
    const paypalCaptureId = extractPaypalCaptureId(captureResponse);

    const db = getDB();
    const ordersCollection = db.collection('orders');

    const query = orderId
      ? { $or: [{ orderId }, { paypalOrderId: targetPaypalOrderId }, { paypal_order_id: targetPaypalOrderId }] }
      : { $or: [{ paypalOrderId: targetPaypalOrderId }, { paypal_order_id: targetPaypalOrderId }] };

    await ordersCollection.updateOne(
      query,
      {
        $set: {
          status: isPaid ? 'paid' : 'failed',
          paymentStatus: isPaid ? 'paid' : 'failed',
          payment_status: isPaid ? 'paid' : 'failed',
          paymentProvider: 'paypal',
          payment_provider: 'paypal',
          paypalOrderId: targetPaypalOrderId,
          paypal_order_id: targetPaypalOrderId,
          paypalCaptureId: paypalCaptureId,
          paypal_capture_id: paypalCaptureId,
          transactionId: paypalCaptureId || targetPaypalOrderId,
          paidAt: isPaid ? new Date() : null,
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      provider: 'paypal',
      orderID: targetPaypalOrderId,
      captureID: paypalCaptureId,
      status: isPaid ? 'complete' : 'failed',
      paymentStatus: captureStatus,
      raw: captureResponse,
    });
  } catch (error) {
    console.error('PayPal capture error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to capture PayPal order',
      message: 'Failed to capture PayPal order',
    });
  }
});

// PayPal order details for success-page verification
router.get('/paypal/order/:orderID', async (req, res) => {
  try {
    if (!isPaypalConfigured()) {
      return res.status(500).json({ error: 'PayPal not initialized' });
    }

    const { orderID } = req.params;
    if (!orderID) {
      return res.status(400).json({ error: 'PayPal order ID required' });
    }

    const paypalOrder = await getPayment('paypal', { paypalOrderId: orderID });
    const captureId = extractPaypalCaptureId(paypalOrder);

    const db = getDB();
    const ordersCollection = db.collection('orders');
    const orderData = await ordersCollection.findOne({
      $or: [{ paypalOrderId: orderID }, { paypal_order_id: orderID }],
    });

    const paid = paypalOrder?.status === 'COMPLETED';
    const amount = orderData?.amount || extractPaypalAmount(paypalOrder);
    const currency = orderData?.currency || paypalOrder?.purchase_units?.[0]?.amount?.currency_code || 'USD';

    res.json({
      provider: 'paypal',
      orderID,
      status: paid ? 'complete' : 'pending',
      paymentStatus: paypalOrder?.status || 'PENDING',
      amount,
      currency,
      paymentIntentId: captureId,
      paypalCaptureId: captureId,
      order: orderData || null,
      payerEmail: paypalOrder?.payer?.email_address || orderData?.customerEmail || null,
    });
  } catch (error) {
    console.error('Get PayPal order error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to get PayPal order',
      message: 'Failed to retrieve PayPal order',
    });
  }
});

// Create Payment Intent (legacy)
router.post('/create-payment-intent', async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({
        error: 'Stripe not initialized',
        message: 'STRIPE_SECRET is not properly configured',
      });
    }

    const { amount, currency = 'idr', orderId, customerEmail, customerName, country } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    let payment_method_types = ['card'];
    if (String(currency).toLowerCase() === 'idr') {
      payment_method_types.push('id_bank_transfer');
    }

    const paymentIntent = await createPaymentIntent({
      amount: Math.round(Number(amount) * 100),
      currency: String(currency).toLowerCase(),
      payment_method_types,
      metadata: {
        orderId: orderId || 'unknown',
        customerEmail: customerEmail || '',
        customerName: customerName || '',
        country: country || '',
      },
      receipt_email: customerEmail,
    });

    const db = getDB();
    const ordersCollection = db.collection('orders');
    await ordersCollection.insertOne({
      orderId: orderId || paymentIntent.id,
      stripePaymentIntentId: paymentIntent.id,
      payment_intent_id: paymentIntent.id,
      paymentProvider: 'stripe',
      payment_provider: 'stripe',
      amount: Number(amount),
      currency: String(currency).toUpperCase(),
      status: 'pending',
      paymentStatus: 'pending',
      payment_status: 'pending',
      customerEmail: customerEmail || '',
      customerName: customerName || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      provider: 'stripe',
    });
  } catch (error) {
    console.error('Create payment intent error:', error.message);
    res.status(500).json({
      error: error.message || 'Unknown error',
      message: 'Failed to create payment intent',
    });
  }
});

// Confirm Payment (legacy)
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID required' });
    }

    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    const db = getDB();
    const ordersCollection = db.collection('orders');
    const isPaid = paymentIntent.status === 'succeeded';

    await ordersCollection.updateOne(
      { $or: [{ stripePaymentIntentId: paymentIntentId }, { payment_intent_id: paymentIntentId }] },
      {
        $set: {
          status: isPaid ? 'paid' : paymentIntent.status,
          paymentStatus: isPaid ? 'paid' : paymentIntent.status,
          payment_status: isPaid ? 'paid' : paymentIntent.status,
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Confirm payment error:', error.message);
    res.status(500).json({
      error: error.message,
      message: 'Failed to confirm payment',
    });
  }
});

// Get Payment Status (legacy)
router.get('/payment-status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    const db = getDB();
    const ordersCollection = db.collection('orders');
    const orderData = await ordersCollection.findOne({
      $or: [{ stripePaymentIntentId: paymentIntentId }, { payment_intent_id: paymentIntentId }],
    });

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      order: orderData || null,
    });
  } catch (error) {
    console.error('Get status error:', error.message);
    res.status(500).json({
      error: error.message,
      message: 'Failed to get payment status',
    });
  }
});

// Get Stripe session details
router.get('/session/:sessionId', async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ error: 'Stripe not initialized' });
    }

    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const session = await retrieveStripeSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const db = getDB();
    const ordersCollection = db.collection('orders');
    const metadata = session.metadata || {};
    const orderData = await ordersCollection.findOne({
      $or: [
        { orderId: metadata.orderId },
        { stripeSessionId: session.id },
        { stripe_session_id: session.id },
      ],
    });

    const normalizedPaymentIntentId =
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

    res.json({
      provider: 'stripe',
      sessionId: session.id,
      status: session.payment_status === 'paid' ? 'complete' : session.payment_status,
      paymentStatus: session.payment_status,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase(),
      customerEmail: session.customer_email,
      paymentIntent: normalizedPaymentIntentId,
      paymentIntentId: normalizedPaymentIntentId,
      order: orderData || null,
      metadata,
    });
  } catch (error) {
    console.error('Get session error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to get session details',
      message: 'Failed to retrieve payment session',
    });
  }
});

// Stripe Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req?.headers?.['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!isStripeConfigured()) {
    return res.status(500).send('Stripe not initialized');
  }

  let event;

  try {
    if (!secret) {
      event = req.body;
    } else {
      event = constructWebhookEvent(req.body, sig, secret);
    }
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    default:
      break;
  }

  res.json({ received: true });
});

async function handleCheckoutSessionCompleted(session) {
  try {
    const db = getDB();
    const ordersCollection = db.collection('orders');
    const metadata = session.metadata || {};

    await ordersCollection.updateOne(
      {
        $or: [{ stripeSessionId: session.id }, { stripe_session_id: session.id }, { orderId: metadata.orderId }],
      },
      {
        $set: {
          status: 'paid',
          paymentStatus: 'paid',
          payment_status: 'paid',
          paymentProvider: 'stripe',
          payment_provider: 'stripe',
          stripeSessionId: session.id,
          stripe_session_id: session.id,
          stripePaymentIntentId: session.payment_intent || null,
          payment_intent_id: session.payment_intent || null,
          transactionId: session.payment_intent || session.id,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error.message);
  }
}

async function handlePaymentSuccess(paymentIntent) {
  try {
    const db = getDB();
    const ordersCollection = db.collection('orders');

    await ordersCollection.updateOne(
      { $or: [{ stripePaymentIntentId: paymentIntent.id }, { payment_intent_id: paymentIntent.id }] },
      {
        $set: {
          status: 'paid',
          paymentStatus: 'paid',
          payment_status: 'paid',
          paymentProvider: 'stripe',
          payment_provider: 'stripe',
          transactionId: paymentIntent.id,
          updatedAt: new Date(),
        },
      }
    );
  } catch (error) {
    console.error('Error handling payment success:', error.message);
  }
}

async function handlePaymentFailure(paymentIntent) {
  try {
    const db = getDB();
    const ordersCollection = db.collection('orders');

    await ordersCollection.updateOne(
      { $or: [{ stripePaymentIntentId: paymentIntent.id }, { payment_intent_id: paymentIntent.id }] },
      {
        $set: {
          status: 'failed',
          paymentStatus: 'failed',
          payment_status: 'failed',
          paymentProvider: 'stripe',
          payment_provider: 'stripe',
          failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
          updatedAt: new Date(),
        },
      }
    );
  } catch (error) {
    console.error('Error handling payment failure:', error.message);
  }
}

// Get user orders filtered by email (legacy)
router.get('/user-orders/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const db = getDB();
    const ordersCollection = db.collection('orders');

    const orders = await ordersCollection
      .find({ customerEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      email,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get user orders error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to fetch user orders',
      message: 'Failed to retrieve orders',
    });
  }
});

// Get authenticated orders (now provider-agnostic)
router.get('/orders', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found in token' });
    }

    const db = getDB();
    const ordersCollection = db.collection('orders');

    const dbOrders = await ordersCollection
      .find({ customerEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    const normalized = dbOrders.map((order) => {
      const provider = order.paymentProvider || order.payment_provider || (order.paypalOrderId ? 'paypal' : 'stripe');
      const transactionId =
        order.transactionId ||
        order.payment_intent_id ||
        order.stripePaymentIntentId ||
        order.paypal_capture_id ||
        order.paypalCaptureId ||
        order.paypal_order_id ||
        order.paypalOrderId ||
        order.stripe_session_id ||
        order.stripeSessionId ||
        null;

      return {
        id: order._id?.toString() || order.orderId,
        orderId: order.orderId,
        amount: Number(order.amount || 0),
        currency: String(order.currency || 'USD').toUpperCase(),
        status: order.paymentStatus || order.payment_status || order.status || 'pending',
        customerEmail: order.customerEmail || '',
        customerName: order.customerName || '',
        createdAt: order.createdAt || order.updatedAt || new Date().toISOString(),
        updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
        paymentMethod: provider === 'paypal' ? 'paypal' : 'card',
        paymentProvider: provider,
        payment_provider: provider,
        paymentStatus: order.paymentStatus || order.payment_status || 'pending',
        transactionId,
        stripeSessionId: order.stripeSessionId || order.stripe_session_id,
        paymentIntent: order.stripePaymentIntentId || order.payment_intent_id,
        paypalOrderId: order.paypalOrderId || order.paypal_order_id,
        paypalCaptureId: order.paypalCaptureId || order.paypal_capture_id,
        shippingAddress: order.shippingAddress || null,
        shippingRegion: order.shippingRegion || null,
        shippingCost: order.shippingCost || 0,
        items: order.items || [],
      };
    });

    res.json({
      email: userEmail,
      totalOrders: normalized.length,
      orders: normalized,
      source: 'database',
    });
  } catch (error) {
    console.error('Get orders error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to fetch orders',
      message: 'Failed to retrieve orders',
    });
  }
});

module.exports = router;
