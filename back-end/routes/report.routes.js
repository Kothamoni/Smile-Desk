const express = require('express');
const router = express.Router();
const Patient = require('../models/patient.model');

// 1. Add a report to a patient
router.post('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { name, date, url } = req.body;

    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    patient.reports.push({ name, date, url });
    await patient.save();

    res.status(201).json({ message: 'Report added successfully', reports: patient.reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Get all reports of a patient
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.json(patient.reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. Delete a report by ID
router.delete('/:patientId/:reportId', async (req, res) => {
  try {
    const { patientId, reportId } = req.params;

    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    patient.reports = patient.reports.filter(r => r._id.toString() !== reportId);
    await patient.save();

    res.json({ message: 'Report deleted successfully', reports: patient.reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
