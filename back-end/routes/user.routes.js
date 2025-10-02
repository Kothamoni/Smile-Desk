const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model"); // no .js needed for CommonJS

const router = express.Router();

// Generate unique userId
function generateUserId() {
  return "DENTAL-" + Math.floor(Math.random() * 1000000);
}

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, address, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      userId: generateUserId(),
      name,
      phone,
      email,
      address,
      password: hashedPassword
    });

    await user.save();
    res.json({ message: "Signup successful! Please login." });
  } catch (err) {
    res.status(500).json({ message: "Error signing up", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    res.json({ message: `Login successful! Welcome, ${user.name}` });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

module.exports = router;
