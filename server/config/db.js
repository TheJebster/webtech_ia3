const mongoose = require('mongoose');

// Cache the *promise*, not the resolved connection, so concurrent requests
// during a cold start (Vercel serverless) share a single connect attempt.
let connectionPromise = null;

const connectDB = async () => {
  // Reuse an already-open connection (readyState 1 = connected).
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Reuse an in-flight connection attempt.
  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error(
      'MONGO_URI is not set. Add it to server/.env (local) or the Vercel project environment variables.'
    );
  }

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn.connection;
    })
    .catch((error) => {
      // Reset so a later call can retry instead of being stuck forever.
      connectionPromise = null;
      console.error(`MongoDB connection error: ${error.message}`);
      throw error;
    });

  return connectionPromise;
};

mongoose.connection.on('disconnected', () => {
  connectionPromise = null;
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

module.exports = connectDB;
