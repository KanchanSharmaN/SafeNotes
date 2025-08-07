const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err);
        process.exit(1); // Exit the process if connection fails
    }
};

module.exports = connectDB;

