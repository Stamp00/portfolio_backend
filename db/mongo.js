import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || undefined;

  if (!uri) {
    console.warn("⚠️  No MONGODB_URI set; backend will run without DB.");
    return;
  }
  await mongoose.connect(uri, { dbName });
  console.log("✅ Mongo connected", dbName ? `(${dbName})` : "");

  // optional: graceful shutdown
  const close = async () => {
    await mongoose.connection.close();
    process.exit(0);
  };
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}
