const axios = require('axios');

function getPaypalConfig() {
  const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase();
  const baseURL = env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  return {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    env,
    baseURL,
  };
}

function isPaypalConfigured() {
  const cfg = getPaypalConfig();
  return Boolean(cfg.clientId && cfg.clientSecret);
}

function getSafeFrontendBaseUrl(orderData = {}) {
  return (
    orderData.frontendBaseUrl ||
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    'https://jualan-online.vercel.app'
  );
}

async function getAccessToken() {
  const cfg = getPaypalConfig();
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error('PayPal is not configured');
  }

  const auth = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64');
  const response = await axios.post(
    `${cfg.baseURL}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

async function createPaypalOrder(orderData) {
  const token = await getAccessToken();
  const cfg = getPaypalConfig();

  const amount = Number(orderData.amount || 0);
  const currency = String(orderData.currency || 'USD').toUpperCase();
  const orderId = orderData.orderId || `ORDER-${Date.now()}`;
  const frontendBaseUrl = getSafeFrontendBaseUrl(orderData);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid checkout payload');
  }

  const response = await axios.post(
    `${cfg.baseURL}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: `Order #${orderId}`,
        },
      ],
      payer: {
        name: {
          given_name: orderData.customerName || '',
        },
        email_address: orderData.customerEmail || undefined,
      },
      application_context: {
        brand_name: 'Jualan Online',
        user_action: 'PAY_NOW',
        return_url: `${frontendBaseUrl}/payment-success?provider=paypal`,
        cancel_url: orderData.currentUrl || `${frontendBaseUrl}/checkout`,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

async function capturePaypalOrder(paypalOrderId) {
  const token = await getAccessToken();
  const cfg = getPaypalConfig();

  const response = await axios.post(
    `${cfg.baseURL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

async function getPaypalOrder(paypalOrderId) {
  const token = await getAccessToken();
  const cfg = getPaypalConfig();

  const response = await axios.get(`${cfg.baseURL}/v2/checkout/orders/${paypalOrderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

module.exports = {
  isPaypalConfigured,
  createPaypalOrder,
  capturePaypalOrder,
  getPaypalOrder,
};
