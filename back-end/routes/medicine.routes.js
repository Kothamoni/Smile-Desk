const express = require('express');
const router = express.Router();
const Medicine = require('../models/medicine.model');

// Fetch all medicines
router.get('/', async (req, res) => {
    try {
        const medicines = await Medicine.find({});
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Add new medicine
router.post("/add", async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// In your Express route
router.post("/medicines/add", async (req, res) => {
  try {
    const medicines = req.body; // expecting an array
    const result = await Medicine.insertMany(medicines);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
