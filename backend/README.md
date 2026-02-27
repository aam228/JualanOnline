# Anjay E-commerce Backend API

Backend API untuk aplikasi e-commerce Anjay menggunakan Express.js dan MongoDB.

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Konfigurasi Environment
File `.env` sudah dibuat dengan konfigurasi:
```
MONGODB_URI=mongodb+srv://adamwildan:@Adamwildan@cluster0.0oaajah.mongodb.net/?appName=Cluster0
PORT=5000
DB_NAME=anjay_shop
```

### 3. Seed Database (Isi Data Awal)
```bash
node seed.js
```

### 4. Jalankan Server
```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Testing API

### Get All Products
```bash
curl http://localhost:5000/api/products
```

### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 100000,
    "category": "Test",
    "description": "Test description",
    "icon": "🎁",
    "stock": 10
  }'
```

## Struktur Database

Collection: `products`

```json
{
  "_id": "ObjectId",
  "name": "string",
  "price": "number",
  "category": "string",
  "description": "string",
  "icon": "string",
  "stock": "number"
}
```
