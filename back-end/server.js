const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dentalDB';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// API Routes
app.use('/patients', require('./routes/patient.routes'));
app.use('/advice', require('./routes/advice.routes'));
app.use('/medicines', require('./routes/medicine.routes'));
app.use('/options', require('./routes/options.routes'));
app.use('/reports', require('./routes/report.routes'));
app.use('/', require('./routes/user.routes')); // login/signup API

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'image')));

// Serve frontend files
app.use(express.static(path.join(__dirname, '../front-end'))); // <-- path to your frontend folder

// Catch-all route: sends your main HTML for any other request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front-end', 'login.html')); // <-- replace with your main HTML
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
