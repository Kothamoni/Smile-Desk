const express = require('express');
const router = express.Router();
const Patient = require('../models/patient.model');

// Generate sequential patientId (starting from 21025)
async function generatePatientId() {
  const lastPatient = await Patient.findOne().sort({ patientId: -1 }).exec();

  if (lastPatient && !isNaN(lastPatient.patientId)) {
    return (parseInt(lastPatient.patientId) + 1).toString();
  } else {
    return "21025"; // first ID
  }
}

// Add patient
router.post('/add', async (req, res) => {
  try {
    const { name, age, gender, address, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and Phone required' });
    }

    // ✅ Await here
    const patientId = await generatePatientId();

    const newPatient = new Patient({
      patientId,
      name,
      age: age || undefined,
      gender,
      address,
      phone
    });

    await newPatient.save();
    res.status(201).json({ message: "Patient saved", patient: newPatient });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// PUT /patients/update/:patientId
router.put("/update/:patientId", async (req, res) => {
  const { patientId } = req.params;
  const {
    cc,
    ho,
    ss,
    dx,
    tp,
    drugHistory,
    nextVisit,
    reports
  } = req.body;

  try {
    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // Update fields if provided
    if (cc) patient.cc = cc;
    if (ho) patient.ho = ho;
    if (ss) patient.ss = ss;
    if (dx) patient.dx = dx;
    if (tp) patient.tp = tp;
    if (drugHistory) patient.drugHistory = drugHistory;
    if (nextVisit) patient.nextVisit = nextVisit;
    if (reports) patient.reports = reports;

    await patient.save();
    res.json({ message: "Patient updated successfully", patient });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/add/:patientId', async (req, res) => {
  const { treatments, totalBill, discount, paidToday, totalPaid, totalDue } = req.body;
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    patient.payments.push({ treatments, totalBill, discount, paidToday, totalPaid, totalDue });
    await patient.save();

    res.json({ message: "Payment saved successfully", payments: patient.payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET patient by patientId
router.get("/id/:patientId", async (req, res) => {
  console.log("Looking for patient:", req.params.patientId);
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    console.error("Error finding patient:", err);
    res.status(500).json({ error: err.message });
  }
});
// GET all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    console.log("Fetched patients:", patients); // check console
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;