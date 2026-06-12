import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  // Fixes querySrv ECONNREFUSED lookup issues on some networks/Node versions
  dns.setDefaultResultOrder('ipv4first');
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose does not need useNewUrlParser, useUnifiedTopology, etc.
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
