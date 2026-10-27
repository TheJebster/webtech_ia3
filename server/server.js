const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // fallback to cwd or pre-set env vars

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const equipmentRoutes = require('./routes/equipment');
const userRoutes = require('./routes/users');
const rentalRoutes = require('./routes/rentals');

const app = express();

// Middleware
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: origin not allowed'));
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check — useful for confirming the DB link from the browser or Vercel.
app.get('/api/health', async (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  try {
    await connectDB();
    res.json({
      status: 'ok',
      db: states[mongoose.connection.readyState] || 'unknown',
      dbName: mongoose.connection.name,
    });
  } catch (error) {
    res.status(503).json({ status: 'error', db: 'disconnected', message: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rentals', rentalRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Event Equipment Rental API' });
});

// Connect DB and start server (local dev only)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(() => {
      console.error('Server not started: database connection failed.');
      process.exit(1);
    });
}

module.exports = app;
