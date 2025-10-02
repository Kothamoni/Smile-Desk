const express = require('express');
const router = express.Router();
const Advice = require('../models/advice.model');

// Fetch all advice
router.get('/', async (req, res) => {
    try {
        const advices = await Advice.find({});
        res.json(advices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add advice manually
router.post('/add', async (req, res) => {
    try {
        const advice = new Advice(req.body);
        await advice.save();
        res.json({ message: 'Advice added', advice });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
