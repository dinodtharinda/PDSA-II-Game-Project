// Main application entry point
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

// Import routes
const apiRoutes = require('./src/routes/api');
const pageRoutes = require('./src/routes/pages');
const errorHandler = require('./src/middleware/errorHandler');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/', pageRoutes);
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
