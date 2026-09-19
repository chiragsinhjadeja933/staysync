const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Security and utility middleware
app.use(helmet());

const allowedFrontend = FRONTEND_URL.startsWith('http') ? FRONTEND_URL : `https://${FRONTEND_URL}`;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server, mobile)
    if (!origin) return callback(null, true);
    if (
      origin === FRONTEND_URL ||
      origin === allowedFrontend ||
      origin === 'http://localhost:3000' ||
      origin === 'http://127.0.0.1:3000' ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }
    // Fallback permissive for deployment previews
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Property Management Platform API is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root API information
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Real-Time Property Rental, Maintenance & Amenity Management Platform API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      properties: '/api/properties',
      units: '/api/units',
      maintenance: '/api/maintenance',
      amenities: '/api/amenities',
      bookings: '/api/bookings',
      dashboard: '/api/dashboard'
    }
  });
});

// Authentication Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Property & Unit Management Routes (Phase 5)
const propertyRoutes = require('./routes/propertyRoutes');
const unitRoutes = require('./routes/unitRoutes');
app.use('/api/properties', propertyRoutes);
app.use('/api/units', unitRoutes);

// Maintenance Requests Routes (Phase 6)
const maintenanceRoutes = require('./routes/maintenanceRoutes');
app.use('/api/maintenance', maintenanceRoutes);

// Amenity & Booking Routes (Phase 7 & 8)
const amenityRoutes = require('./routes/amenityRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/amenities', amenityRoutes);
app.use('/api/bookings', bookingRoutes);

// Dashboard Analytics Routes (Phase 9)
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Healthcheck at http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);

  // Render Free-Tier Keep-Alive Pinger (Runs every 5 minutes)
  const pingUrl = process.env.RENDER_EXTERNAL_URL || process.env.PING_URL;
  if (pingUrl) {
    const targetUrl = `${pingUrl.replace(/\/+$/, '')}/api/health`;
    const FIVE_MINUTES = 5 * 60 * 1000;
    setInterval(async () => {
      try {
        const response = await fetch(targetUrl);
        console.log(`[Keep-Alive] 5-min ping to ${targetUrl} (Status: ${response.status})`);
      } catch (err) {
        console.warn(`[Keep-Alive] Ping warning: ${err.message}`);
      }
    }, FIVE_MINUTES);
    console.log(`⏱️ Keep-alive checker active: Pinging ${targetUrl} every 5 minutes`);
  }
});

module.exports = app;
