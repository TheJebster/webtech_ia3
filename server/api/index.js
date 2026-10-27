const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();
const connectDB = require('../config/db');
const app = require('../server');

// Ensure DB is connected for serverless
connectDB();

module.exports = app;
