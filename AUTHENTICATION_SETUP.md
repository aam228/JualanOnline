# Authentication & Authorization System Documentation

## Overview

This document describes the complete authentication and authorization system implemented in the ecommerce application. The system includes login, registration, JWT-based token authentication, and role-based access control (RBAC) for admin features.

## System Architecture

### Backend Components

**1. Authentication Middleware (`backend/middleware/auth.js`)**
- `verifyToken`: Verifies JWT tokens from incoming requests
- `requireAdmin`: Checks if user has admin role
- `requireAuth`: Checks if user is authenticated

**2. Authentication Routes (`backend/routes/auth.js`)**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login (returns JWT token)
- `GET /auth/me` - Get current authenticated user
- `POST /auth/logout` - Logout (client-side token removal)

**3. Protected Admin Routes**
- `POST /admin/products` - Create product (admin only)
- `PUT /admin/products/:id` - Update product (admin only)
- `DELETE /admin/products/:id` - Delete product (admin only)

### Frontend Components

**1. Authentication Context (`frontend/src/context/AuthContext.tsx`)**
- Manages authentication state globally
- Stores token and user information
- Provides login, register, logout functions
- Auto-verifies token on app load

**2. Protected Routes (`frontend/src/components/ProtectedRoute.tsx`)**
- `ProtectedRoute` - Protects authenticated-only pages
- `AdminRoute` - Protects admin-only pages

**3. Authentication Pages**
- `LoginPage` - User login form
- `RegisterPage` - User registration form
- `ProfilePage` - User profile information
- `OrdersPage` - Order history (placeholder)

**4. Updated Components**
- `Header` - Shows login/register or user menu based on auth state
- `AdminDashboard` - Protected admin product management
- `AdminProductForm` - Protected admin product editor

## User Model

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  role: String ('user' or 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

## Setup Instructions

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables** in `.env`:
   ```
   JWT_SECRET=your-secret-key-change-this-in-production
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=jualan_online
   PORT=5000
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **No additional setup needed** - AuthProvider is already wrapped in App.tsx

2. **Ensure VITE_API_URL is set** in `.env` or `.env.local`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## Usage Guide

### For Users

#### Registration
1. Click "Register" in the header
2. Fill in Name, Email, Password
3. Password must be at least 6 characters
4. Click "Register" button
5. Automatically logged in after successful registration
6. Redirected to homepage

#### Login
1. Click "Login" in the header
2. Enter email and password
3. Click "Login" button
4. Token stored in localStorage
5. Redirected to homepage

#### Logout
1. Click on user name in header
2. Click "Logout" from dropdown menu
3. Token removed from localStorage
4. Redirected to homepage

#### User Menu
After login, user can access:
- **Profile** - View account information
- **Orders** - View order history
- **Logout** - Sign out of account

### For Admins

#### Admin Dashboard Access
1. Login with admin account
2. Click "Admin Dashboard" link in header (yellow button)
3. View all products with pagination
4. Create, Edit, or Delete products

#### Create Product
1. From Admin Dashboard, click "Add Product"
2. Fill in product details
3. Add product images
4. Configure measurements and shipping
5. Click "Create" or "Update"

#### Edit Product
1. From Admin Dashboard, click Edit icon (pencil)
2. Modify product information
3. Click "Update"

#### Delete Product
1. From Admin Dashboard, click Delete icon (trash can)
2. Confirm deletion
3. Product removed from database

## Technical Details

### JWT Token Structure

Tokens are signed with the secret key and contain:
```javascript
{
  _id: user._id,
  email: user.email,
  name: user.name,
  role: user.role
}
```

**Token Expiration:** 7 days

### Password Security

- Passwords are hashed using bcrypt (10 salt rounds)
- Passwords are never stored in plaintext
- Passwords are never sent to frontend

### API Request Headers

Protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

Example:
```javascript
fetch(`${API_URL}/admin/products`, {
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  }
})
```

## Error Handling

### Common Errors and Solutions

**401 Unauthorized**
- Token is missing, invalid, or expired
- Solution: Login again to get a new token

**403 Forbidden**
- User doesn't have required permissions (not admin)
- Solution: Admin access required for this operation

**409 Conflict**
- Email already registered
- Solution: Use a different email or login with existing account

**400 Bad Request**
- Missing required fields or invalid data
- Solution: Check all fields are filled correctly

## Security Best Practices

✅ **Implemented**
- Passwords hashed with bcrypt
- JWT tokens used for stateless authentication
- Token expiration (7 days)
- Authorization checks on protected routes
- Role-based access control (RBAC)

⚠️ **Production Considerations**
- Change JWT_SECRET to a strong, random value
- Use HTTPS in production
- Consider adding refresh token mechanism
- Implement rate limiting on auth endpoints
- Add CSRF protection for state-changing operations
- Consider adding 2FA for admin accounts
- Log all auth attempts and admin actions
- Regularly rotate JWT_SECRET

## Testing

### Manual Testing Steps

**1. Test Registration**
```bash
POST http://localhost:5000/api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**2. Test Login**
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**3. Test Protected Route**
```bash
GET http://localhost:5000/api/auth/me
Headers: Authorization: Bearer <token_from_login>
```

**4. Test Admin Protection**
```bash
POST http://localhost:5000/api/admin/products
Headers: Authorization: Bearer <admin_token>
Body: { product data }
```

### UI Testing

1. **Unauthenticated State**
   - [ ] Login button visible
   - [ ] Register button visible
   - [ ] Can access homepage, products, collections
   - [ ] Cannot access checkout
   - [ ] Cannot access admin pages

2. **Authenticated User State**
   - [ ] User dropdown visible
   - [ ] Profile link works
   - [ ] Orders link works
   - [ ] Logout button works
   - [ ] Admin Dashboard link NOT visible

3. **Admin State**
   - [ ] User dropdown visible
   - [ ] Admin Dashboard link visible (yellow button)
   - [ ] Can create products
   - [ ] Can edit products
   - [ ] Can delete products

## Future Enhancements

1. **Refresh Token Mechanism**
   - Implement refresh tokens for better security
   - Automatic token refresh before expiration

2. **Email Verification**
   - Verify email before account activation
   - Resend verification email

3. **Password Reset**
   - Forgot password functionality
   - Email-based password reset

4. **Two-Factor Authentication**
   - Optional 2FA for admin users
   - TOTP-based authentication

5. **Session Management**
   - Track active sessions
   - Revoke sessions
   - Device management

6. **Audit Logging**
   - Log all authentication events
   - Log all admin operations
   - User activity tracking

7. **Advanced RBAC**
   - More granular roles (editor, moderator, etc.)
   - Permission-based access control

## Troubleshooting

### Token Not Saved
- Check browser is not in private/incognito mode
- Verify localStorage is enabled
- Check browser console for errors

### Cannot Login
- Verify email and password are correct
- Check user is registered
- Verify backend is running

### Admin Routes Not Working
- Verify user has admin role in database
- Check token is included in request
- Verify token is still valid (not expired)

### CORS Errors
- Verify frontend and backend URLs are correct
- Check CORS configuration in backend server.js
- Frontend URL must be in CORS allowlist

## File Structure

```
Backend:
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Auth endpoints
│   └── admin-products.js    # Protected admin routes
└── server.js                # Main server file

Frontend:
├── context/
│   └── AuthContext.tsx      # Global auth state
├── components/
│   ├── Header.tsx           # Updated auth UI
│   └── ProtectedRoute.tsx   # Protected route wrapper
└── pages/
    ├── LoginPage.tsx        # Login form
    ├── RegisterPage.tsx     # Registration form
    ├── ProfilePage.tsx      # User profile
    └── OrdersPage.tsx       # Order history
```

## Support

For issues or questions about the authentication system:
1. Check the troubleshooting section
2. Review backend logs
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
5. Ensure MongoDB connection is working
