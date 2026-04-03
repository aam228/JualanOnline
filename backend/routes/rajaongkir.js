// RajaOngkir shipping cost API integration
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Set your RajaOngkir API key in .env as RAJAONGKIR_API_KEY
const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = 'https://api.rajaongkir.com/starter';

// GET /api/rajaongkir/cities
router.get('/cities', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/city`, {
      headers: { key: RAJAONGKIR_API_KEY }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rajaongkir/cost
router.post('/cost', async (req, res) => {
  try {
    const { origin, destination, weight, courier } = req.body;
    const { data } = await axios.post(`${BASE_URL}/cost`, {
      origin, destination, weight, courier
    }, {
      headers: {
        key: RAJAONGKIR_API_KEY,
        'content-type': 'application/x-www-form-urlencoded'
      }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
