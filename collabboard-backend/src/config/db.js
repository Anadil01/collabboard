const mongoose = require("mongoose");
const { env } = require("./env");

const connectDB = async () => {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  const uri = env.MONGO_URI.trim();

  // Keep deployment Atlas-only.
  if (!uri.includes("mongodb.net")) {
    throw new Error(
      "Invalid MONGO_URI: use a MongoDB Atlas connection string (mongodb+srv://...mongodb.net/... or mongodb://...mongodb.net/...)"
    );
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000
    });
    return conn;
  } catch (error) {
    const isSrvDnsError =
      error?.code === "ENOTFOUND" ||
      error?.code === "ECONNREFUSED" ||
      String(error?.message || "").toLowerCase().includes("querysrv");

    if (isSrvDnsError && uri.startsWith("mongodb+srv://")) {
      error.message =
        `${error.message}\n` +
        "Atlas DNS lookup failed for mongodb+srv URI. " +
        "In Atlas, use the 'Standard connection string' (mongodb://host1,host2,host3/...)" +
        " to avoid SRV DNS dependency on your current network.";
    }

    throw error;
  }
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
