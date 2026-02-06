import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { connectDB } from './config/index.js';
import listingRoutes from './routes/listing.route.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); 
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api/listings', listingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Rental Marketplace API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      listings: '/api/listings',
      documentation: 'See README.md for API documentation'
    }
  });
});

// 404 handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedUrl: req.originalUrl
  });
});

// Global error handler - Must be last
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 Server running on port ${PORT}         ║
║   📝 Environment: ${process.env.NODE_ENV || 'development'}              ║
║   🌐 API URL: http://localhost:${PORT}      ║
║   📚 Health: http://localhost:${PORT}/api/health ║
╚════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});