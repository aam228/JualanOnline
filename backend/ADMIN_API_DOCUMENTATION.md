# Admin Products API Documentation

## Base URL
```
http://localhost:5000/api/admin/products
```

## Endpoints

### 1. GET All Products (Paginated)
```
GET /api/admin/products?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10

**Response:**
```json
{
  "data": [
    {
      "_id": "iphone-15-pro",
      "name": "iPhone 15 Pro",
      "brand": "Apple",
      "slug": "iphone-15-pro",
      "category": {
        "id": "cat_elektronik",
        "name": "Elektronik",
        "subcategory": {
          "id": "subcat_smartphone",
          "name": "Smartphone"
        }
      },
      "description": {
        "short": "Smartphone flagship dengan chip A17 Pro",
        "long": "Detailed description..."
      },
      "images": [],
      "priceRange": {
        "min": 18000000,
        "max": 26000000,
        "currency": "IDR"
      },
      "variantOptions": [
        {
          "name": "Warna",
          "type": "color",
          "values": ["Hitam", "Putih", "Biru"]
        }
      ],
      "skus": [
        {
          "sku": "IP15P-BLK-128",
          "isActive": true,
          "variants": { "Warna": "Hitam", "Storage": "128GB" },
          "stock": 0,
          "price": 18000000,
          "currency": "IDR"
        }
      ],
      "physical": {
        "weight": 187,
        "weightUnit": "gram",
        "dimensions": {
          "length": 146.6,
          "width": 70.6,
          "height": 8.25,
          "unit": "mm"
        }
      },
      "tags": ["smartphone", "apple"],
      "isPublished": true,
      "status": "available",
      "ratings": {
        "average": 4.8,
        "count": 127
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 2. GET Single Product
```
GET /api/admin/products/:id
```

**Parameters:**
- `id`: Product ID (slug or ObjectId)

**Response:** Single product object (same structure as above)

---

### 3. POST Create New Product
```
POST /api/admin/products
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "iPhone 15 Pro",
  "brand": "Apple",
  "slug": "iphone-15-pro",
  "category": {
    "id": "cat_elektronik",
    "name": "Elektronik",
    "subcategory": {
      "id": "subcat_smartphone",
      "name": "Smartphone"
    }
  },
  "description": {
    "short": "Smartphone flagship dengan chip A17 Pro",
    "long": "Detailed description..."
  },
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "alt": "iPhone 15 Pro",
      "isPrimary": true
    }
  ],
  "variantOptions": [
    {
      "name": "Warna",
      "type": "color",
      "values": ["Hitam", "Putih", "Biru"]
    },
    {
      "name": "Storage",
      "type": "size",
      "values": ["128GB", "256GB", "512GB"]
    }
  ],
  "skus": [
    {
      "sku": "IP15P-BLK-128",
      "isActive": true,
      "variants": { "Warna": "Hitam", "Storage": "128GB" },
      "stock": 10,
      "price": 18000000,
      "currency": "IDR"
    }
  ],
  "physical": {
    "weight": 187,
    "weightUnit": "gram",
    "dimensions": {
      "length": 146.6,
      "width": 70.6,
      "height": 8.25,
      "unit": "mm"
    }
  },
  "tags": ["smartphone", "apple", "flagship"],
  "isPublished": true
}
```

**Response:**
```json
{
  "message": "Product created successfully",
  "id": "iphone-15-pro",
  "product": { ... }
}
```

**Notes:**
- If `skus` is not provided, they will be auto-generated from `variantOptions`
- `slug` must be unique
- `priceRange` is automatically calculated from SKUs

---

### 4. PUT Update Product
```
PUT /api/admin/products/:id
Content-Type: application/json
```

**Parameters:**
- `id`: Product ID (slug or ObjectId)

**Request Body:** Same as POST (any fields can be updated)

**Response:**
```json
{
  "message": "Product updated successfully",
  "product": { ... }
}
```

---

### 5. PATCH Update Single SKU
```
PATCH /api/admin/products/:id/sku/:skuId
Content-Type: application/json
```

**Parameters:**
- `id`: Product ID
- `skuId`: SKU code (e.g., "IP15P-BLK-128")

**Request Body:**
```json
{
  "stock": 15,
  "price": 18500000,
  "isActive": true
}
```

**Response:**
```json
{
  "message": "SKU updated successfully",
  "sku": {
    "sku": "IP15P-BLK-128",
    "isActive": true,
    "variants": { "Warna": "Hitam", "Storage": "128GB" },
    "stock": 15,
    "price": 18500000,
    "currency": "IDR"
  }
}
```

---

### 6. POST Bulk Update SKUs
```
POST /api/admin/products/:id/skus/bulk
Content-Type: application/json
```

**Parameters:**
- `id`: Product ID

**Request Body:**
```json
{
  "skus": [
    {
      "sku": "IP15P-BLK-128",
      "isActive": true,
      "variants": { "Warna": "Hitam", "Storage": "128GB" },
      "stock": 15,
      "price": 18500000,
      "currency": "IDR"
    },
    {
      "sku": "IP15P-BLK-256",
      "isActive": true,
      "variants": { "Warna": "Hitam", "Storage": "256GB" },
      "stock": 8,
      "price": 20000000,
      "currency": "IDR"
    }
  ]
}
```

**Response:**
```json
{
  "message": "SKUs updated successfully",
  "skus": [ ... ]
}
```

---

### 7. DELETE Product
```
DELETE /api/admin/products/:id
```

**Parameters:**
- `id`: Product ID (slug or ObjectId)

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: name, slug, category"
}
```

### 404 Not Found
```json
{
  "error": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message details"
}
```

---

## Data Structure Reference

### Product Object
```typescript
{
  _id: string;                    // Unique ID (usually slug)
  slug: string;                   // URL-friendly identifier
  name: string;                   // Product name
  brand: string;                  // Brand name
  category: {
    id: string;
    name: string;
    subcategory?: {
      id: string;
      name: string;
    };
  };
  description: {
    short: string;                // Brief description
    long: string;                 // Detailed description
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  variantOptions: Array<{
    name: string;                 // e.g., "Warna", "Storage"
    type: string;                 // e.g., "color", "size"
    values: string[];             // e.g., ["Hitam", "Putih"]
  }>;
  skus: Array<{
    sku: string;                  // Unique SKU code
    isActive: boolean;
    variants: Record<string, string>;  // e.g., { "Warna": "Hitam", "Storage": "128GB" }
    stock: number;
    price: number;
    currency: string;
  }>;
  physical: {
    weight: number;
    weightUnit: string;           // "gram" or "kg"
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;               // "mm" or "cm"
    };
  };
  tags: string[];
  isPublished: boolean;
  status: "available" | "discontinued";
  ratings: {
    average: number;              // 0-5
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Usage Examples

### Create Product with Auto-Generated SKUs
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "brand": "Apple",
    "slug": "iphone-15-pro",
    "category": {
      "id": "cat_elektronik",
      "name": "Elektronik"
    },
    "variantOptions": [
      {
        "name": "Warna",
        "type": "color",
        "values": ["Hitam", "Putih"]
      }
    ]
  }'
```

### Update Stock for Specific SKU
```bash
curl -X PATCH http://localhost:5000/api/admin/products/iphone-15-pro/sku/IP15P-BLK-128 \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 25,
    "price": 18500000
  }'
```

### Get Products with Pagination
```bash
curl "http://localhost:5000/api/admin/products?page=2&limit=20"
```
