const mongoose = require('mongoose');

const ParticularSchema = new mongoose.Schema({
  particular: String,
  price: Number,
  quadrant: String
});

const ContractSchema = new mongoose.Schema({
  patientId: String, // could be ObjectId reference if you prefer
  contractDetails: String,
  contractDate: Date,
  particulars: [ParticularSchema],
  discountPercent: Number,
  discountAmount: Number,
  totalBill: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contract', ContractSchema);
