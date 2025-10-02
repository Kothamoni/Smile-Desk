const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // cc, ho, ss, dx, tp
  value: { type: String, required: true }
});

module.exports = mongoose.model('Option', optionSchema);
