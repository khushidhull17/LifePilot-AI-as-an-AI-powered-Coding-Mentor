import mongoose from 'mongoose';

/**
 * Connect to MongoDB. The connection string is supplied through MONGODB_URI.
 * For local development the default is mongodb://127.0.0.1:27017/lifepilot.
 */
export async function connectDB(uri) {
  mongoose.set('strictQuery', true);

  try {
    const connection = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
    return connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
