const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scholarship_admin';
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
