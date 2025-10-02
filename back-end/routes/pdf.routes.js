const express = require('express');
const router = express.Router();
const Patient = require('../models/patient.model');
const jsPDF = require('jspdf');
require('jspdf-autotable'); // for tables

router.get('/:patientId', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Dental Treatment Record', 105, 15, null, null, 'center');
    doc.setFontSize(12);

    // Patient card
    doc.text(`Patient Name: ${patient.name}`, 14, 30);
    doc.text(`Age: ${patient.age}`, 14, 38);
    doc.text(`Gender: ${patient.gender}`, 14, 46);
    doc.text(`ID: ${patient.patientId}`, 14, 54);

    // Drug history table
    const drugData = patient.drugHistory.map(d => [d.medicineName, d.genericName, d.dosage, d.duration, d.instruction]);
    doc.autoTable({
      startY: 65,
      head: [['Medicine', 'Generic', 'Dosage', 'Duration', 'Instruction']],
      body: drugData
    });

    // Save PDF
    const fileName = `Patient_${patient.patientId}.pdf`;
    doc.save(fileName);

    res.json({ message: 'PDF generated', file: fileName });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
