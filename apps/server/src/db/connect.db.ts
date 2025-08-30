import mongoose from "mongoose";

async function connectDb(uri: string) {
  try {
    await mongoose.connect(uri);
    console.log("Connected to database");
  } catch (error) {
    console.error("Failed to connect to database : " + error);
    process.exit(1);
  }
}
export { connectDb };
