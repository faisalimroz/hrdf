import mongoose from 'mongoose';

/**
 * Connect to MongoDB with proper error handling and event listeners.
 */
export const connectDB = async () => {
  try {
    // const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hdfd_foundation';
        const mongoUri = process.env.MONGO_URI || 'mongodb+srv://jago:qD75LNtc8mbT6zLY@cluster0.aksx3gf.mongodb.net?appName=Jagobd';

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true, // Build indexes automatically in development
    });

    console.log(`[MongoDB] Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection Failed: ${error.message}`);
    // Exit process with failure in fatal database startup failure
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Warning: Database connection lost.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Connection Runtime Error: ${err.message}`);
});

export default connectDB;
