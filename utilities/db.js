import mongoose from "mongoose";
import "dotenv/config";

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log(`Database connected at ${process.env.DB_URL}`);
  } catch (error) {
    console.log("Database Connection Error: ", error.message);
  }
};

export default dbConnect;
