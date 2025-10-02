const mongoose = require('mongoose');

const adviceSchema = new mongoose.Schema({
    banglish: String,
    bengali: String
});

module.exports = mongoose.model('Advice', adviceSchema);
