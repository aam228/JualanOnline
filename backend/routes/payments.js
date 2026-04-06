
const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// CORS preflight handler for all /payments routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Stripe Checkout Session endpoint
router.post('/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not initialized' });
    }
    const {
      amount,
      currency = 'idr',
      customerEmail,
      customerName,
      orderId,
      items = [],
      shippingAddress = {},
      shippingRegion = '',
      shippingCost = 0,
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!customerName || !shippingAddress.address1 || !shippingAddress.city || !shippingAddress.country) {
      return res.status(400).json({ error: 'Incomplete shipping/customer data' });
    }

    const normalizedOrderId = orderId || `ORDER-${Date.now()}`;
    // Tentukan base URL frontend (support localhost & production)
    let frontendBaseUrl = 'https://jualanonline.vercel.app';
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      frontendBaseUrl = origin;
    }
    const productSlug = req.body.productSlug || '';
    const currentUrl = req.body.currentUrl || '';

    // Save draft transaction before payment so seller has complete transaction data.
    let draftOrderInserted = false;
    try {
      const db = getDB();
      const ordersCollection = db.collection('orders');
      await ordersCollection.updateOne(
        { orderId: normalizedOrderId },
        {
          $setOnInsert: {
            orderId: normalizedOrderId,
            customerEmail: customerEmail || '',
            customerName,
            amount,
            currency,
            status: 'pending_payment',
            paymentStatus: 'unpaid',
            orderSource: 'checkout-session',
            items,
            shippingAddress,
            shippingRegion,
            shippingCost,
            createdAt: new Date(),
          },
          $set: {
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      draftOrderInserted = true;
    } catch (dbError) {
      console.error('Failed to save draft order before checkout:', dbError.message);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: { name: 'Order #' + normalizedOrderId },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${frontendBaseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: currentUrl || `${frontendBaseUrl}/product/${productSlug}`,
      metadata: {
        orderId: normalizedOrderId,
        customerName,
        currentUrl,
        shippingRegion: String(shippingRegion || ''),
      },
    });

    // Link Stripe session into draft order for reliable payment reconciliation.
    if (draftOrderInserted) {
      try {
        const db = getDB();
        const ordersCollection = db.collection('orders');
        await ordersCollection.updateOne(
          { orderId: normalizedOrderId },
          {
            $set: {
              stripeSessionId: session.id,
              updatedAt: new Date(),
            },
          }
        );
      } catch (dbError) {
        console.error('Failed to link checkout session to order:', dbError.message);
      }
    }

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize Stripe dengan error handling
let stripe;
try {
  if (!process.env.STRIPE_SECRET) {
    throw new Error('STRIPE_SECRET environment variable is not defined');
  }
  stripe = require('stripe')(process.env.STRIPE_SECRET);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('🔴 Stripe Initialization Error:', error.message);
  stripe = null;
}

// Create Payment Intent

router.post('/create-payment-intent', async (req, res) => {
  try {
    // Check Stripe initialization
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe not initialized',
        message: 'STRIPE_SECRET is not properly configured'
      });
    }

    const { amount, currency = 'idr', orderId, customerEmail, customerName, country } = req.body;

    console.log('📝 Creating payment intent with data:', { amount, currency, orderId, customerEmail, country });

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Tentukan payment method types sesuai currency
    let payment_method_types = ['card'];
    if (currency.toLowerCase() === 'idr') {
      payment_method_types.push('id_bank_transfer');
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (cents)
      currency: currency.toLowerCase(),
      payment_method_types,
      metadata: {
        orderId: orderId || 'unknown',
        customerEmail: customerEmail,
        customerName: customerName,
        country: country || '',
      },
      receipt_email: customerEmail,
    });

    console.log('✅ Payment Intent created:', paymentIntent.id);

    // Save order to database
    try {
      const db = getDB();
      const ordersCollection = db.collection('orders');
      
      await ordersCollection.insertOne({
        orderId: orderId || paymentIntent.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
        status: 'pending',
        customerEmail: customerEmail,
        customerName: customerName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Still return success if payment intent was created
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('🔴 Payment Intent Error:', error.message || error);
    res.status(500).json({ 
      error: error.message || 'Unknown error',
      message: 'Failed to create payment intent'
    });
  }
});

// Confirm Payment
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID required' });
    }

    // Retrieve payment intent status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Update order status
    try {
      const db = getDB();
      const ordersCollection = db.collection('orders');
      
      const status = paymentIntent.status === 'succeeded' ? 'completed' : paymentIntent.status;
      
      await ordersCollection.updateOne(
        { stripePaymentIntentId: paymentIntentId },
        {
          $set: {
            status: status,
            updatedAt: new Date(),
          }
        }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    res.json({
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to confirm payment'
    });
  }
});

// Get Payment Status
router.get('/payment-status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Get order from database
    let orderData = null;
    try {
      const db = getDB();
      const ordersCollection = db.collection('orders');
      orderData = await ordersCollection.findOne({ stripePaymentIntentId: paymentIntentId });
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      order: orderData || null,
    });
  } catch (error) {
    console.error('Get Status Error:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to get payment status'
    });
  }
});

// ✅ NEW: Get Stripe Session Details
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get order from database
    let orderData = null;
    try {
      const db = getDB();
      const ordersCollection = db.collection('orders');
      const metadata = session.metadata || {};
      orderData = await ordersCollection.findOne({ 
        orderId: metadata.orderId 
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    // Return session details
    res.json({
      sessionId: session.id,
      status: session.payment_status === 'paid' ? 'complete' : session.payment_status,
      paymentStatus: session.payment_status,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase(),
      customerEmail: session.customer_email,
      paymentIntent: session.payment_intent?.id,
      order: orderData || null,
      metadata: session.metadata || {},
    });
  } catch (error) {
    console.error('Get Session Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get session details',
      message: 'Failed to retrieve payment session'
    });
  }
});

// Stripe Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!secret) {
      console.log('No webhook secret configured, skipping verification');
      event = req.body;
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    }
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle different event types
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
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

async function handleCheckoutSessionCompleted(session) {
  try {
    const db = getDB();
    const ordersCollection = db.collection('orders');
    const metadata = session.metadata || {};

    // Update only once to avoid duplicate side effects (like duplicate WA notifications).
    const updateResult = await ordersCollection.updateOne(
      {
        $and: [
          {
            $or: [
              { stripeSessionId: session.id },
              { orderId: metadata.orderId },
            ],
          },
          { paymentStatus: { $ne: 'paid' } },
        ],
      },
      {
        $set: {
          status: 'completed',
          paymentStatus: 'paid',
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent || null,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log(`✅ Order marked paid from checkout session: ${metadata.orderId || session.id}`);
    }

    console.log(`✅ Checkout session paid: ${session.id}`);
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
  }
}

async function handlePaymentSuccess(paymentIntent) {
  try {
    const db = getDB();
    const ordersCollection = db.collection('orders');
    
    await ordersCollection.updateOne(
      { stripePaymentIntentId: paymentIntent.id },
      {
        $set: {
          status: 'completed',
          paymentStatus: 'paid',
          updatedAt: new Date(),
        }
      }
    );

    console.log(`✅ Payment succeeded for order: ${paymentIntent.metadata.orderId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent) {
  try {
    const db = getDB();
    const ordersCollection = db.collection('orders');
    
    await ordersCollection.updateOne(
      { stripePaymentIntentId: paymentIntent.id },
      {
        $set: {
          status: 'failed',
          paymentStatus: 'failed',
          failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
          updatedAt: new Date(),
        }
      }
    );

    console.log(`❌ Payment failed for order: ${paymentIntent.metadata.orderId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// ✅ NEW: Get user orders filtered by email
router.get('/user-orders/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Security: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Fetch orders from database filtered by email
    const db = getDB();
    const ordersCollection = db.collection('orders');
    
    const orders = await ordersCollection
      .find({ customerEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      email: email,
      totalOrders: orders.length,
      orders: orders,
    });
  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch user orders',
      message: 'Failed to retrieve orders'
    });
  }
});

// ✅ NEW: Get user orders from Stripe (authenticated endpoint)
router.get('/orders', verifyToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe not initialized',
        message: 'STRIPE_SECRET is not properly configured'
      });
    }

    // Get user email from authenticated session
    const userEmail = req.user.email;
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found in token' });
    }

    try {
      // Fetch all checkout sessions from Stripe
      // Limit to 100 per request (default and optimized for most users)
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
        expand: ['data.payment_intent', 'data.customer_details'],
      });

      console.log(`📊 Fetched ${sessions.data.length} checkout sessions from Stripe`);

      // Filter sessions by customer email
      const userOrders = sessions.data
        .filter(session => {
          const sessionEmail = session.customer_details?.email || session.customer_email;
          return sessionEmail && sessionEmail.toLowerCase() === userEmail.toLowerCase();
        })
        .map(session => ({
          id: session.id,
          orderId: session.id,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Convert cents to dollars
          currency: (session.currency || 'idr').toUpperCase(),
          status: session.payment_status === 'paid' ? 'completed' : session.payment_status || 'pending',
          customerEmail: session.customer_details?.email || session.customer_email,
          customerName: session.customer_details?.name || 'Unknown',
          createdAt: new Date(session.created * 1000).toISOString(),
          updatedAt: new Date(session.created * 1000).toISOString(),
          stripeSessionId: session.id,
          paymentIntent: session.payment_intent?.id,
          paymentMethod: session.payment_method_types?.[0] || 'card',
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Merge additional checkout details from database (address/items/shipping info).
      let dbOrdersMap = new Map();
      try {
        const db = getDB();
        const ordersCollection = db.collection('orders');
        const sessionIds = userOrders.map((o) => o.id).filter(Boolean);
        if (sessionIds.length > 0) {
          const dbOrders = await ordersCollection
            .find({ stripeSessionId: { $in: sessionIds } })
            .toArray();
          dbOrdersMap = new Map(dbOrders.map((o) => [o.stripeSessionId, o]));
        }
      } catch (dbError) {
        console.error('Failed to enrich orders with DB details:', dbError.message);
      }

      const enrichedOrders = userOrders.map((order) => {
        const detail = dbOrdersMap.get(order.id);
        return {
          ...order,
          shippingAddress: detail?.shippingAddress || null,
          shippingRegion: detail?.shippingRegion || null,
          shippingCost: detail?.shippingCost || 0,
          items: detail?.items || [],
        };
      });

      console.log(`✅ Found ${userOrders.length} orders for user: ${userEmail}`);

      res.json({
        email: userEmail,
        totalOrders: enrichedOrders.length,
        orders: enrichedOrders,
        source: 'stripe', // Indicate data comes from Stripe, not database
      });
    } catch (stripeError) {
      console.error('Stripe API Error:', stripeError.message);
      return res.status(500).json({
        error: 'Failed to fetch from Stripe',
        message: stripeError.message,
      });
    }
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch orders',
      message: 'Failed to retrieve orders'
    });
  }
});

module.exports = router;
