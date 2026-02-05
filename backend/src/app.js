/**
 * @fileoverview Express application configuration
 * @module app
 */
const { errorHandler } = require('./middleware/errorHandler');

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);



app.use(errorHandler);
/**
 * Configured Express application instance
 * @type {express.Application}
 */
module.exports = app;



