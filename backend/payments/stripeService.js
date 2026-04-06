const Stripe = require('stripe');

let stripeClient = null;

function getStripeClient() {
  if (stripeClient) {
    return stripeClient;
  }

  if (!process.env.STRIPE_SECRET) {
    return null;
  }

  stripeClient = new Stripe(process.env.STRIPE_SECRET);
  return stripeClient;
}

function isStripeConfigured() {
  return Boolean(getStripeClient());
}

async function createStripeCheckoutSession(orderData) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  const {
    amount,
    currency,
    customerEmail,
    orderId,
    frontendBaseUrl,
    currentUrl,
    productSlug,
    customerName,
    shippingRegion,
  } = orderData;

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: `Order #${orderId}` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: customerEmail,
    success_url: `${frontendBaseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
    cancel_url: currentUrl || `${frontendBaseUrl}/product/${productSlug || ''}`,
    metadata: {
      orderId,
      customerName,
      currentUrl: currentUrl || '',
      shippingRegion: String(shippingRegion || ''),
      paymentProvider: 'stripe',
    },
  });
}

async function retrieveStripeSession(sessionId) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'line_items'],
  });
}

async function listStripeCheckoutSessions(limit = 100) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  return stripe.checkout.sessions.list({
    limit,
    expand: ['data.payment_intent', 'data.customer_details'],
  });
}

async function createPaymentIntent(payload) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  return stripe.paymentIntents.create(payload);
}

async function retrievePaymentIntent(paymentIntentId) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  return stripe.paymentIntents.retrieve(paymentIntentId);
}

function constructWebhookEvent(rawBody, signature, webhookSecret) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

module.exports = {
  getStripeClient,
  isStripeConfigured,
  createStripeCheckoutSession,
  retrieveStripeSession,
  listStripeCheckoutSessions,
  createPaymentIntent,
  retrievePaymentIntent,
  constructWebhookEvent,
};
