const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Debug: Check environment
console.log('🔍 Environment Check:');
console.log('   STRIPE_SECRET:', process.env.STRIPE_SECRET ? '✅ Configured' : '❌ NOT SET');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configured' : '❌ NOT SET');
console.log('   DB_NAME:', process.env.DB_NAME || 'Not set');

const { connectDB } = require('./config/db');
const productsRouter = require('./routes/products');
const adminProductsRouter = require('./routes/admin-products');
const shippingRouter = require('./routes/shipping');
const paymentsRouter = require('./routes/payments');
const uploadRouter = require('./routes/upload');
const flawsRouter = require('./routes/flaws');
const rajaOngkirRouter = require('./routes/rajaongkir');
const authRouter = require('./routes/auth');
const cartRouter = require('./routes/cart');

const app = express();
const PORT = process.env.PORT;

// Middleware
const allowedOrigins = [
  'https://jualan-online.vercel.app',
  'https://jualanonline-production.up.railway.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl/Postman/server-to-server)
    if (!origin) return callback(null, true);

    // Allow all localhost ports for local frontend dev (Vite can auto-switch ports)
    if (/^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Anjay E-commerce API' });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/shipping', shippingRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/flaws', flawsRouter);
app.use('/api/rajaongkir', rajaOngkirRouter);

// Serve uploaded images statically
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));
// Serve flaw uploads statically
app.use('/uploads/flaws', express.static(require('path').join(__dirname, 'uploads/flaws')));

// Start server
async function startServer() {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      const host = process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : `http://localhost:${PORT}`;
      console.log(`🚀 Server running on ${host}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  const { client } = require('./config/db');
  await client.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});
