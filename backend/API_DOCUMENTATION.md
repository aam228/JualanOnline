# API Documentation

Base URL: `http://localhost:5000/api`

## Categories API

### Get All Categories
```
GET /categories
```
Response:
```json
[
  {
    "_id": "...",
    "name": "Elektronik",
    "icon": "💻",
    "subcategories": [
      { "id": "1", "name": "Laptop" },
      { "id": "2", "name": "Smartphone" }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Single Category
```
GET /categories/:id
```

### Create Category
```
POST /categories
Content-Type: application/json

{
  "name": "Elektronik",
  "icon": "💻",
  "subcategories": [
    { "id": "1", "name": "Laptop" }
  ]
}
```

### Update Category
```
PUT /categories/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "icon": "🎮"
}
```

### Delete Category
```
DELETE /categories/:id
```

### Add Subcategory
```
POST /categories/:id/subcategories
Content-Type: application/json

{
  "name": "Tablet"
}
```

### Delete Subcategory
```
DELETE /categories/:id/subcategories/:subcategoryId
```

## Variants API

### Get All Variant Types
```
GET /variants
```
Response:
```json
[
  {
    "_id": "...",
    "name": "Warna",
    "options": ["Hitam", "Putih", "Biru", "Merah"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Single Variant Type
```
GET /variants/:id
```

### Create Variant Type
```
POST /variants
Content-Type: application/json

{
  "name": "Warna",
  "options": ["Hitam", "Putih", "Biru"]
}
```

### Update Variant Type
```
PUT /variants/:id
Content-Type: application/json

{
  "name": "Warna",
  "options": ["Hitam", "Putih", "Biru", "Merah", "Hijau"]
}
```

### Delete Variant Type
```
DELETE /variants/:id
```

## Products API

### Get All Products
```
GET /products
```
Response:
```json
[
  {
    "_id": "...",
    "name": "Laptop Gaming ROG",
    "price": 15000000,
    "category": "Elektronik",
    "subcategory": "Laptop",
    "description": "...",
    "icon": "💻",
    "stock": 10,
    "status": "available",
    "variants": [
      {
        "name": "RAM",
        "options": ["8GB", "16GB", "32GB"]
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Single Product
```
GET /products/:id
```

### Create Product
```
POST /products
Content-Type: application/json

{
  "name": "Laptop Gaming",
  "price": 15000000,
  "category": "Elektronik",
  "subcategory": "Laptop",
  "description": "...",
  "icon": "💻",
  "stock": 10,
  "status": "available",
  "variants": [
    {
      "name": "RAM",
      "options": ["8GB", "16GB", "32GB"]
    }
  ]
}
```

### Update Product
```
PUT /products/:id
Content-Type: application/json

{
  "price": 14000000,
  "stock": 15
}
```

### Delete Product
```
DELETE /products/:id
```

## Setup Instructions

### 1. Seed Categories and Variants
```bash
cd backend
node seedCategories.js
```

### 2. Seed Products
```bash
node seed.js
```

### 3. Start Server
```bash
npm start
```

## Example Usage

### Create a new product with category and variants
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung Galaxy S24",
    "price": 12000000,
    "category": "Elektronik",
    "subcategory": "Smartphone",
    "description": "Smartphone flagship Samsung terbaru",
    "icon": "📱",
    "stock": 20,
    "status": "available",
    "variants": [
      {
        "name": "Warna",
        "options": ["Hitam", "Putih", "Ungu"]
      },
      {
        "name": "Storage",
        "options": ["128GB", "256GB", "512GB"]
      }
    ]
  }'
```

### Get all categories with subcategories
```bash
curl http://localhost:5000/api/categories
```

### Get all variant types
```bash
curl http://localhost:5000/api/variants
```
