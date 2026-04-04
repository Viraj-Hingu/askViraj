import mongoose from "mongoose";

const connect = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Connected to Db");
  } catch (error) {
    console.log("Error while Connecting", error.message);
    process.exit(1);
  }
};
export default connect;
