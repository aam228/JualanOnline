# Cart Persistence Fix - Complete Testing Guide

## Overview
This document walks through the complete fix for cart persistence issues. The problem was that cart data wasn't being loaded from MongoDB on refresh, even though it was being saved.

## Root Cause Analysis

### Issues Found:
1. **API URL Mismatch** - Frontend `.env.local` was pointing to production (Railway) instead of local backend
2. **Insufficient Logging** - No debug info to trace cart sync flow
3. **Missing Error Handling** - Cart fetch failures were silently ignored
4. **Logout Not Handled** - Cart sync flag wasn't reset on logout
5. **No Environment Detection** - API URL had no fallback for development

## Fixes Applied

### 1. Frontend Fixes

#### a. Create Shared API URL Utility
**File:** `frontend/src/utils/apiUrl.ts` (NEW)
```typescript
export function getApiBaseUrl(): string {
  // Priority: env var > localhost detection > produc fallback
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  
  if (localhost && port 5173/5174/5175) {
    return 'http://localhost:5000/api'; // dev
  }
  
  return 'https://jualanonline-production.up.railway.app/api'; // prod
}
```

#### b. Update All Context/Service Files
Updated to use the shared utility:
- `frontend/src/context/CartContext.tsx` - Added comprehensive logging + better error handling
- `frontend/src/context/AuthContext.tsx` - Use shared utility + auth logging
- `frontend/src/services/api.ts` - Reference shared utility
- `frontend/src/services/payment.ts` - Reference shared utility

#### c. Improve CartContext Flow
```
MOUNT
  ├─ Load from localStorage (always)
  └─ Auth loads from localStorage & verifies token (async)

AUTH VERIFIED
  ├─ CartProvider detects: isAuthenticated = true, token = set
  └─ Trigger effect: Fetch /api/cart with Bearer token

FETCH COMPLETE
  ├─ Merge: backend items + local items (dedup)
  └─ Save to state + localStorage

STATE CHANGE
  ├─ Any update triggers auto-sync: PUT /api/cart
  └─ Save to backend + localStorage
```

#### d. Development Environment File
**File:** `frontend/.env.development` (NEW)
```
VITE_API_URL=http://localhost:5000/api
```

### 2. Backend Fixes

#### a. Cart API Improvements (`backend/routes/cart.js`)
- Added **detailed logging** with `[CART]` tags for debugging
- **Validation** of userId from JWT token
- **Response structure** consistency (status field for differentiation)
- **Error details** (dev mode shows error message)
- **Data integrity checks** on items from database

#### b. API Endpoints

**GET /api/cart**
```javascript
// Returns:
{
  userId: "<id>",
  items: [...],
  updatedAt: <timestamp>,
  status: "existing" | "new"
}
```

**PUT /api/cart**
```javascript
// Upserts cart to MongoDB
// Validates, dedupes, normalizes items
// Returns: success: true, items: [], savedCount: N, isNew: bool
```

**DELETE /api/cart**
```javascript
// Clears items, keeps timestamps
// Returns: success: true, items: []
```

## How to Test

### Step 1: Verify Backend Configuration
```bash
# Check backend .env file
cat backend/.env | grep -E "MONGODB_URI|PORT|JWT_SECRET"
```

Should show:
- `MONGODB_URI=mongodb+srv://...`
- `PORT=5000`
- `JWT_SECRET=...`

### Step 2: Start Backend Server
```bash
cd backend
npm run dev
# Expected output: "🚀 Server running on http://localhost:5000"
```

### Step 3: Verify Backend is Ready
```bash
# Test backend health check
curl http://localhost:5000
# Expected: {"message":"Anjay E-commerce API"}

# Test cart endpoint (should return 401 without token)
curl http://localhost:5000/api/cart
# Expected: {"error":"No token provided"}
```

### Step 4: Start Frontend in New Terminal
```bash
cd frontend
npm run dev
# Expected: "VITE v7.3.1 ready in XYZ ms"
# Open http://localhost:5173
```

### Step 5: Test Local Development Flow

#### Test 1: Add Item to Cart (Not Logged In)
```
1. Open http://localhost:5173
2. Click on any product → "Add to Cart"
3. Open DevTools Console → Should see:
   [API] Using VITE_API_URL: http://localhost:5000/api
   [CART DEBUG] Saved cart to localStorage, items: 1
   ✓ Produk berhasil ditambahkan ke keranjang
4. Open DevTools → Application → LocalStorage → shoppingCart
   → Should contain product JSON
```

#### Test 2: Refresh Page (Still Not Logged In)
```
1. Press F5 to refresh
2. Check Console → Should see:
   [CART DEBUG] Saved cart to localStorage, items: 1
3. Cart should still show item count in header
4. Expected: Data persists from localStorage ✓
```

#### Test 3: Login and Sync Cart
```
1. Click Profile/Login
2. Enter credentials (or register new account)
3. Check Console → Should see:
   [AUTH] Using API URL: http://localhost:5000/api
   [AUTH] ✅ Token verified successfully
   [CART DEBUG] Auth still loading, skipping remote cart load
   [CART DEBUG] Starting remote cart load...
   [CART DEBUG] Backend returned cart: {...}
   [CART DEBUG] Merged cart (remote + local): X items
   ✅ Remote cart loaded and merged successfully
4. MongoDB should have cart in `carts` collection
5. Expected: Items loaded from backend ✓
```

#### Test 4: Refresh After Login
```
1. Press F5 to refresh
2. Check Console → Should see:
   [AUTH] Using API URL: http://localhost:5000/api
   [AUTH] ✅ Token verified successfully
   [CART DEBUG] Starting remote cart load...
   [CART DEBUG] Backend returned cart: {...}
   ✅ Remote cart loaded and merged successfully
3. Cart should display items from MongoDB
4. Expected: Data loads from backend on refresh ✓
```

#### Test 5: Add Item While Logged In
```
1. Click on product → Add to Cart
2. Check Console → Should see:
   [CART DEBUG] Saved cart to localStorage, items: X
   [CART DEBUG] Syncing cart to backend, items: X
   ✅ Cart synced to backend
3. MongoDB `carts` collection should update with new item
4. Expected: Item saved to both localStorage and MongoDB ✓
```

#### Test 6: Logout and Login as Different User
```
1. Logout → Console shows:
   [AUTH] ✅ Logout complete - auth state cleared
2. Login with different account
3. Check Console → Should load THAT user's cart, not previous
4. Expected: No data bleeding between users ✓
```

### Step 6: Monitor MongoDB Changes
Open MongoDB Compass or shell and watch the `carts` collection:
```bash
# Show all carts
db.carts.find()

# Watch specific user cart
db.carts.findOne({ userId: ObjectId("...") })

# Watch updates in real-time (MongoDB 4.4+)
db.carts.watch()
```

## Debugging Tips

### Console Logs to Watch For:
1. `[API]` - API URL detection
2. `[AUTH]` - Authentication flow
3. `[CART DEBUG]` - Cart state changes
4. If production, `[CART]` logs will appear in backend console

### Enable Verbose Debugging:
Edit `frontend/src/context/CartContext.tsx`:
```typescript
const DEBUG_CART = true; // Already enabled by default
```

### Check Network Tab:
1. Open DevTools → Network
2. Filter by `/api/cart` 
3. Click requests to see:
   - Request headers (Authorization token)
   - Response (`items: [...]`)
   - Status codes (200, 401, 500, etc)

### If Cart Still Not Loading:

**Check 1: Backend Connectivity**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/cart
```

**Check 2: MongoDB Connection**
```bash
# Backend console should show no errors
# Check .env: MONGODB_URI is correct
```

**Check 3: Token Validity**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/auth/me
# Should return user object, not 401
```

**Check 4: CORS Issue**
```bash
# Backend CORS allows localhost:* ports
# Check server.js has correct regex
/^http:\/\/localhost:\d+$/
```

## Files Modified Summary

### Frontend Changes:
- ✅ `src/utils/apiUrl.ts` - NEW, shared API URL utility
- ✅ `src/context/CartContext.tsx` - Improved with logging, error handling
- ✅ `src/context/AuthContext.tsx` - Uses shared utility, auth logging
- ✅ `src/services/api.ts` - References shared utility
- ✅ `src/services/payment.ts` - References shared utility
- ✅ `.env.development` - NEW, development configuration

### Backend Changes:
- ✅ `routes/cart.js` - Added detailed logging, validation, error handling
- ✅ `server.js` - Cart route already registered

## Expected Outcomes

After all fixes:
1. ✅ Cart items persist in localStorage (for offline)
2. ✅ Cart items sync to MongoDB (for cross-device)
3. ✅ On refresh, items load from backend
4. ✅ Multiple users have separate carts
5. ✅ Detailed logging helps debug issues
6. ✅ API URL auto-detects development vs production
7. ✅ Logout clears auth but preserves cart option
8. ✅ No data loss on browser refresh

## Performance Notes

- Cart sync to backend is NOT debounced (happens on every state change)
- For heavy usage, consider adding debounce:
  ```typescript
  const syncTimer = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      // PUT request here
    }, 500); // Wait 500ms after last change
  }, [cart]);
  ```

## Production Deployment

When deploying:
1. Frontend `.env.local` → `VITE_API_URL=https://jualanonline-production.up.railway.app/api`
2. Or remove `.env.local` to use environment detection
3. Backend will automatically allow Railway domain in CORS
4. MongoDB will use production URI from `.env`

---

**Last Updated:** 2024
**Status:** All fixes applied and tested locally
