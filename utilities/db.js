import mongoose from "mongoose";
import "dotenv/config";

const dbConnect = async () => {
  try {
    if (process.env.mode === "production") {
      await mongoose.connect(process.env.DB_URL);
      console.log(`Production database connected at ${process.env.DB_URL}`);
    } else {
      await mongoose.connect(process.env.DB_LOCAL_URL);
      console.log(`Dev database connected at ${process.env.DB_LOCAL_URL}`);
    }
  } catch (error) {
    console.log("Database Connection Error: ", error.message);
  }
};

export default dbConnect;
