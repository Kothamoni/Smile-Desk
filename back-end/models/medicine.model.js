const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: String,
    genericName: String,
    strength: String,
    type: String,
    uses: String,
    manufacturer: String
});

module.exports = mongoose.model('Medicine', medicineSchema);


