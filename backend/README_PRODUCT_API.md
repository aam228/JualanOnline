# Product API & Admin Product Creation

## Backend
- CRUD endpoints for Product (with all fields)
- Image upload endpoint (S3/Cloudinary ready)
- Flaw documentation with photo
- RajaOngkir shipping cost integration
- Role-based access (admin)
- Rate limiting (10 products/hour)
- Input sanitization & file validation

## Frontend
- Multi-section form (see requirements)
- Real-time preview
- Auto-save draft
- Smart validation (React Hook Form + Zod)
- Image management (crop, rotate, compress, tag)
- Measurement guide modal
- Flaw documentation with photo
- Shipping cost calculator
- SEO slug auto-gen
- Responsive, accessible UI
- Admin dashboard integration

## Next Steps
- Run `npx prisma migrate dev` after setting DATABASE_URL
- Implement API endpoints in `/backend/routes/products.js`
- Build frontend page in `/frontend/src/pages/admin/ProductCreatePage.tsx`
