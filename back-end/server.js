// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config(); // load .env variables

const app = express();
app.use(cors());
app.use(express.json());

// ----------------- MongoDB Connection -----------------
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dentalDB';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// ----------------- Static Files -----------------

// Serve images
app.use('/images', express.static(path.join(__dirname, 'image')));
// Serve the rest of the frontend files - accessed at /...
app.use(express.static(path.join(__dirname, '../front-end')));

// Serve the rest of the frontend files statically
app.use(express.static(path.join(__dirname, '../front-end')));


// ----------------- API Routes -----------------
// These are your specific API endpoints
app.use('/patients', require('./routes/patient.routes'));
app.use('/advice', require('./routes/advice.routes'));
app.use('/medicines', require('./routes/medicine.routes'));
app.use('/options', require('./routes/options.routes'));
app.use('/reports', require('./routes/report.routes'));
app.use('/', require('./routes/user.routes')); 

// ----------------- Frontend Catch-all (Regex Fix) -----------------
// This MUST be the last route. It handles the root path ('/') and all other
// unmatched GET requests, serving the frontend file to support routing.
// Using a Regex (/.*/) avoids the 'path-to-regexp' PathError.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/login.html'));
});


// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));