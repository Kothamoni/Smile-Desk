const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');

// create contract
router.post('/', async (req, res) => {
  try {
    const c = new Contract(req.body);
    const saved = await c.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get contracts
router.get('/', async (req, res) => {
  try {
    const contracts = await Contract.find().sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
