const Stripe = require('stripe');

let stripeClient = null;

function isZeroDecimalCurrency(currency) {
  return ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'].includes(
    String(currency || '').toLowerCase()
  );
}

function toFiniteNumber(value) {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
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

function buildFallbackLineItems({ amount, currency, orderId, productSlug }) {
  const unitAmount = normalizeStripeUnitAmount(amount, currency);
  if (!unitAmount) {
    return [];
  }

  return [
    {
      price_data: {
        currency,
        product_data: { name: `Order #${orderId || 'Checkout'}` },
        unit_amount: unitAmount,
      },
      quantity: 1,
    },
  ];
}

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
    successUrl,
    cancelUrl,
    productSlug,
    customerName,
    shippingRegion,
    lineItems,
  } = orderData;

  const normalizedCurrency = String(currency || 'usd').toLowerCase();
  const safeLineItems = Array.isArray(lineItems) && lineItems.length > 0
    ? lineItems
    : buildFallbackLineItems({ amount, currency: normalizedCurrency, orderId, productSlug });

  if (!safeLineItems.length) {
    throw new Error('Invalid checkout payload');
  }

  const safeSuccessUrl = successUrl || `${process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://jualan-online.vercel.app'}/payment-success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`;
  const safeCancelUrl = cancelUrl || `${process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://jualan-online.vercel.app'}/checkout`;

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: safeLineItems,
    mode: 'payment',
    customer_email: customerEmail,
    success_url: safeSuccessUrl,
    cancel_url: safeCancelUrl,
    metadata: {
      orderId,
      customerName,
      currentUrl: orderData.currentUrl || '',
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
