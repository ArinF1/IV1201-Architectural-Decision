/**
 * @fileoverview Express application configuration
 * @module app
 */
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');

const cookieParser = require('cookie-parser');

const applicationRoutes = require('./routes/applicationRoutes');

const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

// In production, serve the React frontend as static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

app.use(errorHandler);
/**
 * Configured Express application instance
 * @type {express.Application}
 */
module.exports = app;



