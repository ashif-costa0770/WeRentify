# Rental Marketplace Backend API

A complete Node.js + Express backend for a rental marketplace platform with MongoDB, Cloudinary file storage, and future Stripe payment integration.

## 🚀 Features

- ✅ Complete CRUD operations for rental listings
- ✅ File upload (photos & videos) with Cloudinary
- ✅ Advanced filtering and search
- ✅ Pagination support
- ✅ Input validation
- ✅ Error handling
- ✅ MVC architecture
- ✅ MongoDB with Mongoose ODM
- 🔜 User authentication (planned)
- 🔜 Stripe payment integration (planned)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Cloudinary account

## 🛠️ Installation

### 1. Clone the repository

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root of the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rental-marketplace
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/rental-marketplace

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

### 4. Get Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret

### 5. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
- Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `.env`

### 6. Run the server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── cloudinary.js         # Cloudinary configuration
│   │   ├── stripe.js             # Stripe config (future)
│   │   └── index.js              # Config exports
│   ├── controllers/
│   │   └── listing.controller.js # Listing business logic
│   ├── middlewares/
│   │   ├── upload.middleware.js  # File upload handling
│   │   └── validation.middleware.js # Input validation
│   ├── models/
│   │   └── listing.model.js      # Listing schema
│   ├── routes/
│   │   └── listing.routes.js     # API routes
│   ├── utils/
│   │   └── response.js           # Response helpers
│   └── server.js                 # Main app entry point
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /api/health
```

### Listings Endpoints

#### 1. Create Listing
```http
POST /api/listings
Content-Type: multipart/form-data
```

**Form Data:**
```
photos: File[] (min 3, max 6) - required
videos: File[] (max 2) - optional
itemName: string - required
category: string - required
description: string - required
pickupLocation: string - required
dailyRate: number - required
hourlyRate: number - optional
weeklyRate: number - optional (auto-calculated if not provided)
isAvailable: boolean - default: true
offerDelivery: boolean - default: false
deliveryFee: number - optional
```

**Response:**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "itemName": "Professional Pressure Washer",
    "category": "tools",
    "description": "High-performance pressure washer...",
    "photos": [
      {
        "public_id": "rental-items/photos/abc123",
        "url": "https://res.cloudinary.com/...",
        "width": 1200,
        "height": 1200
      }
    ],
    "dailyRate": 50,
    "weeklyRate": 297.5,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Get All Listings (with filters)
```http
GET /api/listings?page=1&limit=12&category=tools&minPrice=10&maxPrice=100&search=drill&sortBy=dailyRate&order=asc
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 12)
- `category` (optional)
- `minPrice` (optional)
- `maxPrice` (optional)
- `isAvailable` (optional: true/false)
- `offerDelivery` (optional: true/false)
- `search` (optional: searches in itemName and description)
- `sortBy` (optional: createdAt, dailyRate, views, etc.)
- `order` (optional: asc/desc)

**Response:**
```json
{
  "success": true,
  "message": "Listings retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "totalPages": 5,
    "totalItems": 58,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 3. Get Single Listing
```http
GET /api/listings/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Listing retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "itemName": "Professional Pressure Washer",
    "views": 45,
    ...
  }
}
```

#### 4. Update Listing
```http
PUT /api/listings/:id
Content-Type: multipart/form-data
```

**Form Data:** (all fields optional)
```
photos: File[] - additional photos
videos: File[] - additional videos
itemName: string
category: string
description: string
pickupLocation: string
dailyRate: number
hourlyRate: number
weeklyRate: number
isAvailable: boolean
offerDelivery: boolean
deliveryFee: number
status: string (active/inactive/rented/under_maintenance)
```

#### 5. Delete Listing
```http
DELETE /api/listings/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Listing deleted successfully"
}
```

#### 6. Delete Photo
```http
DELETE /api/listings/:id/photos/:publicId
```

#### 7. Delete Video
```http
DELETE /api/listings/:id/videos/:publicId
```

#### 8. Get Listings by Category
```http
GET /api/listings/category/:category?page=1&limit=12
```

## 🧪 Testing with Postman/Thunder Client

### Creating a Listing

1. Set method to `POST`
2. URL: `http://localhost:5000/api/listings`
3. Body → form-data
4. Add fields:
   - `photos` → File (select 3-6 images)
   - `videos` → File (optional, max 2)
   - `itemName` → Text: "Pressure Washer"
   - `category` → Text: "tools"
   - `description` → Text: "Professional grade..."
   - `pickupLocation` → Text: "123 Main St, City"
   - `dailyRate` → Text: "50"
   - `isAvailable` → Text: "true"
   - `offerDelivery` → Text: "false"

## 📦 Database Schema

### Listing Model

```javascript
{
  photos: [{ public_id, url, width, height, format }],
  videos: [{ public_id, url, width, height, format, duration }],
  itemName: String (required, max 100 chars),
  category: String (required),
  description: String (required, max 5000 chars),
  pickupLocation: String (required),
  hourlyRate: Number (optional, min 0),
  dailyRate: Number (required, min 0),
  weeklyRate: Number (optional, min 0, auto-calculated),
  isAvailable: Boolean (default: true),
  offerDelivery: Boolean (default: false),
  deliveryFee: Number (optional, min 0),
  stripeConnected: Boolean (default: false),
  stripeAccountId: String (optional),
  owner: ObjectId (ref: 'User'),
  views: Number (default: 0),
  bookings: Number (default: 0),
  rating: Number (0-5, default: 0),
  reviewCount: Number (default: 0),
  status: String (active/inactive/rented/under_maintenance),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🔐 Security Features (Current)

- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator
- File type validation
- File size limits (50MB max)
- MongoDB injection prevention (via Mongoose)

## 🚧 Upcoming Features

- [ ] User authentication (JWT)
- [ ] Authorization (owner-only operations)
- [ ] Stripe payment integration
- [ ] Booking system
- [ ] Review and rating system
- [ ] Email notifications
- [ ] Advanced search with Elasticsearch
- [ ] Image optimization
- [ ] Rate limiting
- [ ] API documentation with Swagger

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: MongooseServerSelectionError
```
**Solution:** Check if MongoDB is running, verify connection string in `.env`

### Cloudinary Upload Fails
```
Error: Failed to upload file to Cloudinary
```
**Solution:** Verify Cloudinary credentials in `.env`

### File Upload Issues
```
Error: Unexpected field
```
**Solution:** Ensure field names match: `photos[]` and `videos[]`

## 📝 Notes

- Weekly rate is auto-calculated as: `dailyRate * 7 * 0.85` (15% discount)
- Minimum 3 photos required per listing
- Videos are optional (max 2)
- Files are temporarily stored in `/temp` during upload, then deleted after Cloudinary upload
- All prices are stored as numbers (e.g., 50.00 for $50.00)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC

## 👨‍💻 Author

Your Name

---

**Need help?** Open an issue on GitHub or contact support.