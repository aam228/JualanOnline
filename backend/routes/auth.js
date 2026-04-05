const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// Helper function to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      _id: user._id.toString(), 
      email: user.email, 
      name: user.name,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// REGISTER - Create new user account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user', // Default role is 'user'
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    // Generate token
    const token = generateToken({ ...newUser, _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        _id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// LOGIN - Authenticate user and return token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /auth/me - Verify current user session
router.get('/me', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    // Find user by ID from token
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.user._id)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// LOGOUT - Optional endpoint for client-side token invalidation
router.post('/logout', verifyToken, (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint can be used for logging purposes or future token blacklist functionality
  res.json({ 
    success: true,
    message: 'Logout successful' 
  });
});

module.exports = router;
