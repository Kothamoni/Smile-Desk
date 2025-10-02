// models/patient.model.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: Number,
  gender: String,
  address: String,
  phone: String,
  cc: [String],   // chief complaints
  ho: [String],   // history of illness
  ss: [String],   // objective signs
  dx: [String],   // diagnosis
  tp: [String],   // treatment plan
  payments: [{
    date: { type: Date, default: Date.now },
    treatments: [String],       // treatment names
    totalBill: Number,
    discount: Number,           // percent
    paidToday: Number,
    totalPaid: Number,
    totalDue: Number
  }],
  drugHistory: [{
    medicineName: String,
    genericName: String,
    dosage: String,
    duration: String, // dropdown: 3 / 5 / 7 days
    instruction: String
  }],
  nextVisit: {
    date: Date,
    time: String,
    noOfVisits: Number,
    referredBy: String
  },
  reports: [{
    name: String,
    date: Date,
    url: String
  }],
   payments: [
    {
      treatments: String,
      totalBill: Number,
      discount: Number,
      paidToday: Number,
      totalPaid: Number,
      totalDue: Number,
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
