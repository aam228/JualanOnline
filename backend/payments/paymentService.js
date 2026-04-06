const { createStripeCheckoutSession } = require('./stripeService');
const { createPaypalOrder, capturePaypalOrder, getPaypalOrder } = require('./paypalService');

async function createPayment(provider, orderData) {
  if (provider === 'stripe') {
    return createStripeCheckoutSession(orderData);
  }

  if (provider === 'paypal') {
    return createPaypalOrder(orderData);
  }

  throw new Error(`Unsupported payment provider: ${provider}`);
}

async function capturePayment(provider, payload) {
  if (provider === 'paypal') {
    return capturePaypalOrder(payload.paypalOrderId);
  }

  throw new Error(`Capture not supported for provider: ${provider}`);
}

async function getPayment(provider, payload) {
  if (provider === 'paypal') {
    return getPaypalOrder(payload.paypalOrderId);
  }

  throw new Error(`Get payment not supported for provider: ${provider}`);
}

module.exports = {
  createPayment,
  capturePayment,
  getPayment,
};
