
const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

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
    const { amount, currency = 'idr', customerEmail, customerName, orderId } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: { name: 'Order #' + (orderId || 'unknown') },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: customerEmail,
      success_url: 'https://jualan-online.vercel.app/payment-success',
      cancel_url: `https://jualan-online.vercel.app/product/${req.body.productSlug || ''}`,
      metadata: { orderId, customerName },
    });
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

module.exports = router;
