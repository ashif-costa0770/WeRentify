# 🚀 Quick Setup Guide

Follow these steps to get your rental marketplace backend up and running in minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Setup Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` and fill in your credentials:

### MongoDB Setup
**Option A: Local MongoDB**
```env
MONGODB_URI=mongodb://localhost:27017/rental-marketplace
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rental-marketplace
```

### Cloudinary Setup
1. Sign up at [Cloudinary](https://cloudinary.com/) (free tier available)
2. Go to Dashboard
3. Copy credentials to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 3: Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════╗
║   🚀 Server running on port 5000         ║
║   📝 Environment: development              ║
║   🌐 API URL: http://localhost:5000      ║
║   📚 Health: http://localhost:5000/api/health ║
╚════════════════════════════════════════════╝
✅ MongoDB Connected: localhost
📊 Database: rental-marketplace
```

## Step 4: Test the API

### Option 1: Using Browser
Visit: `http://localhost:5000/api/health`

### Option 2: Using curl
```bash
curl http://localhost:5000/api/health
```

### Option 3: Using Postman
1. Import the file: `Rental_Marketplace_API.postman_collection.json`
2. Use the pre-configured requests

## Step 5: Create Your First Listing

### Using Postman/Thunder Client:

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/listings`
3. **Body:** form-data
4. **Add these fields:**

```
photos: [Select 3-6 image files]
itemName: Professional Pressure Washer
category: tools
description: High-performance pressure washer for rent
pickupLocation: 123 Main St, San Francisco, CA
dailyRate: 50
hourlyRate: 15
isAvailable: true
offerDelivery: true
deliveryFee: 25
```

5. **Click Send**

You should get a response with your created listing!

## Common Issues & Solutions

### ❌ MongoDB Connection Failed
**Problem:** `MongooseServerSelectionError`
**Solution:** 
- Check if MongoDB is running: `mongod`
- Verify connection string in `.env`
- For Atlas: Check IP whitelist (allow 0.0.0.0/0 for testing)

### ❌ Cloudinary Upload Failed
**Problem:** `Failed to upload file to Cloudinary`
**Solution:**
- Verify credentials in `.env`
- Check Cloudinary dashboard for API limits
- Ensure files are not too large (50MB limit)

### ❌ Port Already in Use
**Problem:** `EADDRINUSE: address already in use`
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

Or change port in `.env`:
```env
PORT=5001
```

### ❌ Module Not Found
**Problem:** `Cannot find module 'express'`
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. ✅ Server is running
2. ✅ Test basic endpoints
3. ✅ Create a listing with photos
4. 📖 Read full API documentation in `README.md`
5. 🧪 Import Postman collection for easy testing
6. 🔐 Add authentication (coming soon)
7. 💳 Integrate Stripe (coming soon)

## Testing Checklist

- [ ] Health check works
- [ ] Create listing with 3+ photos
- [ ] Get all listings
- [ ] Get single listing
- [ ] Update listing
- [ ] Delete listing
- [ ] Filter by category
- [ ] Search listings
- [ ] Pagination works

## Need Help?

1. Check `README.md` for detailed documentation
2. Review error logs in terminal
3. Verify all environment variables
4. Check MongoDB and Cloudinary dashboards
5. Use Postman collection for testing

---

**Ready to build something awesome! 🚀**