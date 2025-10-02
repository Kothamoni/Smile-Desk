const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const collectionMap = {
  cc: 'cc_options',
  ho: 'ho_options',
  ss: 's_s_options',
  io: 'investigations_options',
  dx: 'dx_options',
  tp: 'treatment_options',
};

router.get('/:type', async (req, res) => {
  const { type } = req.params;
  const collectionName = collectionMap[type];
  if (!collectionName) return res.status(404).json({ message: 'Invalid type' });

  try {
    const options = await mongoose.connection.collection(collectionName).find({}).toArray();
    res.json(options);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
