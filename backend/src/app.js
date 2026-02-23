/**
 * @fileoverview Express application configuration
 * @module app
 */
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');

const cookieParser = require('cookie-parser');

const applicationRoutes = require('./view/routes/applicationRoutes');

const express = require('express');
const cors = require('cors');
const userRoutes = require('./view/routes/userRoutes');

const app = express();

/**
 * Whitelist of allowed origins for CORS.
 * Built from the CORS_ORIGIN environment variable.
 * Falls back to localhost:5173 for local development if nothing is set.
 */
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];


const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS policy: origin "${origin}" is not allowed.`)
    );
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

// In production, serve the React frontend as static files
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(staticPath));

  // Fallback to index.html for client-side routing (must be after API routes)
  app.use((req, res, next) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(staticPath, 'index.html'));
    } else {
      next();
    }
  });
}

app.use(errorHandler);
/**
 * Configured Express application instance
 * @type {express.Application}
 */
module.exports = app;



