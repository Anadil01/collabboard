require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User.model");
const { hashPassword } = require("../utils/hash");

async function seedDemoUser() {
  const name = process.env.DEMO_USER_NAME || "Demo User";
  const email = process.env.DEMO_USER_EMAIL || "demo@collabboard.dev";
  const password = process.env.DEMO_USER_PASSWORD || "Demo@12345";

  await connectDB();
  const passwordHash = await hashPassword(password);

  await User.findOneAndUpdate(
    { email },
    { name, email, passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("Demo user ready:");
  console.log(`email: ${email}`);
  console.log(`password: ${password}`);
}

seedDemoUser()
  .then(async () => {
    await mongoose.connection.close();
  })
  .catch(async (err) => {
    console.error("Failed to seed demo user:", err.message);
    await mongoose.connection.close();
    process.exit(1);
  });
