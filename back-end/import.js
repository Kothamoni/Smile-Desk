const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");

mongoose.connect("mongodb://127.0.0.1:27017/medicineDB");

const medicineSchema = new mongoose.Schema({
  name: String,
  dosageForm: String,
  company: String
});

const Medicine = mongoose.model("Medicine", medicineSchema);

// Import CSV into MongoDB
fs.createReadStream("medicines_bd.csv")
  .pipe(csv())
  .on("data", async (row) => {
    await Medicine.create({
      name: row.Name,
      dosageForm: row.Dosage,
      company: row.Company
    });
  })
  .on("end", () => {
    console.log("✅ Medicines imported to MongoDB");
    mongoose.disconnect();
  });
