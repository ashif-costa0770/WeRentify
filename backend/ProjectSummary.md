# 📦 Rental Marketplace Backend - Project Summary

## 🎯 Project Overview

A complete **Node.js + Express + MongoDB** backend for a rental marketplace application with **Cloudinary** file storage and future **Stripe** payment integration. Built using the **MVC architecture pattern** with full CRUD operations.

---

## 📁 Delivered Files

### Configuration Files
- ✅ `package.json` - All dependencies and scripts
- ✅ `.env.example` - Environment variables template
- ✅ `.gitignore` - Git ignore rules

### Source Code (`src/`)

#### Config (`src/config/`)
- ✅ `db.js` - MongoDB connection with error handling
- ✅ `cloudinary.js` - Cloudinary upload/delete utilities
- ✅ `stripe.js` - Stripe config placeholder (future)
- ✅ `index.js` - Centralized config exports

#### Controllers (`src/controllers/`)
- ✅ `listing.controller.js` - Complete CRUD operations:
  - Create listing with photos/videos
  - Get all listings (with filters & pagination)
  - Get single listing
  - Update listing
  - Delete listing
  - Delete specific photo/video
  - Get listings by category

#### Middlewares (`src/middlewares/`)
- ✅ `upload.middleware.js` - Multer file upload handling
  - Supports photos (max 6) and videos (max 2)
  - File type validation
  - Size limits (50MB)
  - Error handling
- ✅ `validation.middleware.js` - Express-validator rules
  - Create listing validation
  - Update listing validation
  - ID validation

#### Models (`src/models/`)
- ✅ `listing.model.js` - Mongoose schema with:
  - Photos array (Cloudinary URLs)
  - Videos array (Cloudinary URLs)
  - Item details (name, category, description, location)
  - Pricing (hourly, daily, weekly)
  - Availability & delivery options
  - Auto-calculated weekly rate
  - View tracking
  - Status management
  - Indexes for performance

#### Routes (`src/routes/`)
- ✅ `listing.routes.js` - API endpoints:
  - POST `/api/listings` - Create
  - GET `/api/listings` - Get all (with filters)
  - GET `/api/listings/:id` - Get one
  - PUT `/api/listings/:id` - Update
  - DELETE `/api/listings/:id` - Delete
  - DELETE `/api/listings/:id/photos/:publicId` - Delete photo
  - DELETE `/api/listings/:id/videos/:publicId` - Delete video
  - GET `/api/listings/category/:category` - By category

#### Utils (`src/utils/`)
- ✅ `response.js` - Standardized API responses
  - Success response helper
  - Error response helper
  - Paginated response helper

#### Server
- ✅ `server.js` - Main application entry point
  - Express configuration
  - Middleware setup
  - Route mounting
  - Error handling
  - Health check endpoint

### Documentation
- ✅ `README.md` - Complete API documentation
- ✅ `SETUP_GUIDE.md` - Step-by-step setup instructions
- ✅ `Rental_Marketplace_API.postman_collection.json` - Postman collection

---

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM (Object Data Modeling) |
| **Cloudinary** | File storage (photos/videos) |
| **Multer** | File upload handling |
| **Express-validator** | Input validation |
| **Helmet** | Security headers |
| **CORS** | Cross-origin resource sharing |
| **Compression** | Response compression |
| **Dotenv** | Environment variables |

---

## 📊 Database Schema

```javascript
Listing {
  // Media
  photos: [{ public_id, url, width, height, format }]  // Min 3, Max 6
  videos: [{ public_id, url, duration }]               // Max 2, Optional
  
  // Details (Step 2)
  itemName: String (required, max 100)
  category: String (required)
  description: String (required, max 5000)
  pickupLocation: String (required)
  
  // Pricing (Step 3)
  hourlyRate: Number (optional, min 0)
  dailyRate: Number (required, min 0)
  weeklyRate: Number (auto-calculated: dailyRate * 7 * 0.85)
  
  // Availability (Step 4)
  isAvailable: Boolean (default: true)
  offerDelivery: Boolean (default: false)
  deliveryFee: Number (optional, min 0)
  
  // Payment (Step 5 - Future)
  stripeConnected: Boolean (default: false)
  stripeAccountId: String (optional)
  
  // System fields
  owner: ObjectId (ref: User) - for future auth
  views: Number (default: 0)
  bookings: Number (default: 0)
  rating: Number (0-5)
  reviewCount: Number
  status: Enum (active/inactive/rented/under_maintenance)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

---

## 🚀 API Endpoints

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/listings` | Create listing |
| GET | `/listings` | Get all (with filters) |
| GET | `/listings/:id` | Get single listing |
| PUT | `/listings/:id` | Update listing |
| DELETE | `/listings/:id` | Delete listing |
| DELETE | `/listings/:id/photos/:publicId` | Delete photo |
| DELETE | `/listings/:id/videos/:publicId` | Delete video |
| GET | `/listings/category/:category` | Get by category |

### Query Parameters (GET /listings)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `category` - Filter by category
- `minPrice` - Minimum daily rate
- `maxPrice` - Maximum daily rate
- `isAvailable` - Filter by availability
- `offerDelivery` - Filter by delivery option
- `search` - Search in name/description
- `sortBy` - Sort field (createdAt, dailyRate, views)
- `order` - Sort order (asc/desc)

---

## 🔑 Features Implemented

### ✅ Core Features
- [x] Complete CRUD operations
- [x] File upload (photos & videos)
- [x] Cloudinary integration
- [x] Input validation
- [x] Error handling
- [x] Pagination
- [x] Filtering & search
- [x] Auto-calculated weekly rates
- [x] View tracking
- [x] MVC architecture

### ✅ Security Features
- [x] Helmet.js security headers
- [x] CORS configuration
- [x] File type validation
- [x] File size limits
- [x] MongoDB injection prevention
- [x] Input sanitization

### 🚧 Future Features
- [ ] User authentication (JWT)
- [ ] Authorization (owner-only)
- [ ] Stripe payment integration
- [ ] Booking system
- [ ] Review & rating system
- [ ] Email notifications
- [ ] Rate limiting
- [ ] Advanced search
- [ ] Image optimization

---

## 📝 Environment Variables Required

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/rental-marketplace

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CLIENT_URL=http://localhost:3000

# Stripe (future)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

---

## 🧪 Testing Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start Server
```bash
npm run dev
```

### 4. Test Endpoints
Import `Rental_Marketplace_API.postman_collection.json` into Postman

---

## 📦 NPM Scripts

```json
{
  "start": "node src/server.js",      // Production
  "dev": "nodemon src/server.js",     // Development
}
```

---

## 🗂️ Folder Structure

```
backend/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   ├── stripe.js
│   │   └── index.js
│   ├── controllers/            # Business logic
│   │   └── listing.controller.js
│   ├── middlewares/            # Custom middlewares
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   ├── models/                 # Database models
│   │   └── listing.model.js
│   ├── routes/                 # API routes
│   │   └── listing.routes.js
│   ├── utils/                  # Helper functions
│   │   └── response.js
│   └── server.js               # App entry point
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
├── README.md                   # Full documentation
├── SETUP_GUIDE.md              # Quick setup guide
└── Rental_Marketplace_API.postman_collection.json
```

---

## 🎓 Key Implementation Details

### File Upload Flow
1. Frontend sends files via `multipart/form-data`
2. Multer stores files in memory as Buffer
3. Buffer written to temporary file
4. File uploaded to Cloudinary
5. Cloudinary returns URL and public_id
6. URL saved to MongoDB
7. Temporary file deleted

### Weekly Rate Calculation
```javascript
weeklyRate = dailyRate * 7 * 0.85  // 15% discount
```

### View Tracking
- Incremented automatically when listing is viewed
- Uses Mongoose instance method

### Error Handling
- Standardized response format
- Global error handler
- Multer error handler
- Validation error handler

---

## 🔗 Frontend Integration

### Example API Calls

**Create Listing:**
```javascript
const formData = new FormData();
formData.append('itemName', 'Pressure Washer');
formData.append('category', 'tools');
formData.append('description', 'High-performance...');
formData.append('pickupLocation', '123 Main St');
formData.append('dailyRate', '50');
formData.append('isAvailable', 'true');
formData.append('offerDelivery', 'false');

// Add photos
photos.forEach(photo => {
  formData.append('photos', photo);
});

const response = await fetch('http://localhost:5000/api/listings', {
  method: 'POST',
  body: formData
});
```

**Get Listings:**
```javascript
const response = await fetch(
  'http://localhost:5000/api/listings?page=1&limit=12&category=tools'
);
const data = await response.json();
```

---

## 💡 Tips for Frontend Integration

1. **File Upload**: Use `FormData` for photos/videos
2. **Rich Text**: Send HTML content in `description` field
3. **Boolean Values**: Send as strings ("true"/"false")
4. **Weekly Rate**: Backend auto-calculates, no need to send
5. **Error Handling**: Check `response.success` field
6. **Pagination**: Use `pagination` object in response

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check if MongoDB is running, verify URI |
| Cloudinary upload fails | Verify credentials, check file size |
| File upload error | Ensure field names match: `photos`, `videos` |
| Port in use | Change PORT in .env or kill process |
| Module not found | Run `npm install` |

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Documentation](https://github.com/expressjs/multer)

---

## ✅ Completion Checklist

- [x] MongoDB connection configured
- [x] Cloudinary integration complete
- [x] All CRUD operations implemented
- [x] File upload working (photos & videos)
- [x] Validation middleware added
- [x] Error handling implemented
- [x] API documentation written
- [x] Postman collection created
- [x] Setup guide provided
- [x] MVC structure organized

---

## 🎉 Ready to Use!

Your backend is **production-ready** for CRUD operations. Follow the `SETUP_GUIDE.md` to get started in minutes!

**Next Steps:**
1. Run `npm install`
2. Configure `.env`
3. Start server with `npm run dev`
4. Test with Postman collection
5. Integrate with your frontend

---

**Questions or issues?** Check the README.md for detailed documentation! 🚀