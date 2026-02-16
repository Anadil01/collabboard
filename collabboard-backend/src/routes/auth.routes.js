const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");

const signupValidator = (req) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return "name, email and password are required";
  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) return "email must be valid";
  if (String(password).length < 8) return "password must be at least 8 characters";
  return null;
};

const loginValidator = (req) => {
  const { email, password } = req.body || {};
  if (!email || !password) return "email and password are required";
  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) return "email must be valid";
  return null;
};

router.post("/signup", validate(signupValidator), ctrl.signup);
router.post("/login", validate(loginValidator), ctrl.login);

module.exports = router;
