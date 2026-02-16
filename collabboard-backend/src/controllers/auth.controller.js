const User = require("../models/User.model");
const { hashPassword, comparePassword } = require("../utils/hash");
const { signToken } = require("../utils/jwt");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedName = String(name).trim();

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    passwordHash
  });
  const token = signToken(user._id);

  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = signToken(user._id);
  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
};
