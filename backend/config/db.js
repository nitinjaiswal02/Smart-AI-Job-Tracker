import mongoose from 'mongoose';

// MONGO_URI will point to one of two things depending on environment:
//   - Local dev:  mongodb://127.0.0.1:27017/smart-job-tracker
//   - Production: a MongoDB Atlas connection string (cloud-hosted cluster)

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    
    process.exit(1);
  }
};

export default connectDB;