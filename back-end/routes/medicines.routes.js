const express = require('express');
const router = express.Router();
const Medicine = require('../models/medicine.model');

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new medicine
router.post('/', async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    const savedMed = await medicine.save();
    res.json(savedMed);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
