import mongoose from 'mongoose';

export const connectDb = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('MongoDB URI:', mongoUri); // Log the URI to ensure it's loaded

    if (!mongoUri) {
      throw new Error("MongoDB URI is undefined");
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);  // Exit the process if there's a connection error
  }
};
