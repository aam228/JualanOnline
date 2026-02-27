const express = require('express');
const router = express.Router();
const axios = require('axios');

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const RAJAONGKIR_BASE_URL = process.env.RAJAONGKIR_BASE_URL;
const STORE_ORIGIN_CITY = process.env.STORE_ORIGIN_CITY || '501';

// Get list of domestic destinations (cities) - MOCK DATA
router.get('/cities', async (req, res) => {
  try {
    // Mock data - replace with real API when you have valid key
    const mockCities = {
      data: [
        { city_id: "152", province_id: "6", province: "DKI Jakarta", type: "Kota", city_name: "Jakarta Pusat", postal_code: "10000" },
        { city_id: "153", province_id: "6", province: "DKI Jakarta", type: "Kota", city_name: "Jakarta Selatan", postal_code: "12000" },
        { city_id: "154", province_id: "6", province: "DKI Jakarta", type: "Kota", city_name: "Jakarta Timur", postal_code: "13000" },
        { city_id: "155", province_id: "6", province: "DKI Jakarta", type: "Kota", city_name: "Jakarta Utara", postal_code: "14000" },
        { city_id: "156", province_id: "6", province: "DKI Jakarta", type: "Kota", city_name: "Jakarta Barat", postal_code: "11000" },
        { city_id: "39", province_id: "9", province: "Jawa Barat", type: "Kota", city_name: "Bandung", postal_code: "40000" },
        { city_id: "22", province_id: "9", province: "Jawa Barat", type: "Kota", city_name: "Bekasi", postal_code: "17000" },
        { city_id: "80", province_id: "9", province: "Jawa Barat", type: "Kota", city_name: "Bogor", postal_code: "16000" },
        { city_id: "107", province_id: "9", province: "Jawa Barat", type: "Kota", city_name: "Cimahi", postal_code: "40500" },
        { city_id: "155", province_id: "9", province: "Jawa Barat", type: "Kota", city_name: "Depok", postal_code: "16400" },
        { city_id: "444", province_id: "10", province: "Jawa Tengah", type: "Kota", city_name: "Semarang", postal_code: "50000" },
        { city_id: "445", province_id: "10", province: "Jawa Tengah", type: "Kota", city_name: "Solo", postal_code: "57000" },
        { city_id: "501", province_id: "5", province: "DI Yogyakarta", type: "Kota", city_name: "Yogyakarta", postal_code: "55000" },
        { city_id: "444", province_id: "11", province: "Jawa Timur", type: "Kota", city_name: "Surabaya", postal_code: "60000" },
        { city_id: "255", province_id: "11", province: "Jawa Timur", type: "Kota", city_name: "Malang", postal_code: "65000" },
      ]
    };
    
    res.json(mockCities);
    
    // Uncomment when you have valid API key:
    // const response = await axios.get(`${RAJAONGKIR_BASE_URL}/destination/domestic-destination`, {
    //   headers: { 'apikey': RAJAONGKIR_API_KEY }
    // });
    // res.json(response.data);
  } catch (error) {
    console.error('Error fetching cities:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch cities',
      details: error.response?.data || error.message
    });
  }
});

// Calculate domestic shipping cost - MOCK DATA
router.post('/cost', async (req, res) => {
  try {
    const { destination, weight, courier } = req.body;

    if (!destination || !weight) {
      return res.status(400).json({ 
        error: 'Missing required fields: destination (city_id) and weight (grams)' 
      });
    }

    // Mock data - replace with real API when you have valid key
    const mockCosts = {
      data: {
        results: [
          {
            code: "jne",
            name: "JNE",
            costs: [
              {
                service: "REG",
                description: "Layanan Reguler",
                cost: [{ value: 15000, etd: "2-3", note: "" }]
              },
              {
                service: "YES",
                description: "Yakin Esok Sampai",
                cost: [{ value: 25000, etd: "1", note: "" }]
              }
            ]
          },
          {
            code: "tiki",
            name: "TIKI",
            costs: [
              {
                service: "REG",
                description: "Regular Service",
                cost: [{ value: 18000, etd: "2-3", note: "" }]
              },
              {
                service: "ONS",
                description: "Over Night Service",
                cost: [{ value: 28000, etd: "1", note: "" }]
              }
            ]
          },
          {
            code: "pos",
            name: "POS Indonesia",
            costs: [
              {
                service: "Paket Kilat Khusus",
                description: "Paket Kilat Khusus",
                cost: [{ value: 12000, etd: "3-4", note: "" }]
              }
            ]
          }
        ]
      }
    };

    res.json(mockCosts);

    // Uncomment when you have valid API key:
    // const response = await axios.post(
    //   `${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`,
    //   {
    //     origin: STORE_ORIGIN_CITY,
    //     destination: destination,
    //     weight: weight,
    //     courier: courier || 'jne,tiki,pos'
    //   },
    //   {
    //     headers: { 
    //       'apikey': RAJAONGKIR_API_KEY,
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );
    // res.json(response.data);
  } catch (error) {
    console.error('Error calculating shipping cost:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to calculate shipping cost',
      details: error.response?.data || error.message
    });
  }
});

// Get waybill tracking
router.post('/waybill', async (req, res) => {
  try {
    const { courier, awb } = req.body;
    
    if (!courier || !awb) {
      return res.status(400).json({ 
        error: 'Missing required fields: courier and awb' 
      });
    }

    const response = await axios.post(
      `${RAJAONGKIR_BASE_URL}/track/waybill`,
      { courier, waybill: awb },
      {
        headers: { 
          'apikey': RAJAONGKIR_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching waybill:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch waybill',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
