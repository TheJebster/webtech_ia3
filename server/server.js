const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // fallback to cwd or pre-set env vars

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const equipmentRoutes = require('./routes/equipment');
const userRoutes = require('./routes/users');
const rentalRoutes = require('./routes/rentals');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

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
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;
