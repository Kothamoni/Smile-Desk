const express = require('express');
const mongoose = require('mongoose');
const path = require('path');


const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/dentalDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.use('/patients', require('./routes/patient.routes'));
app.use('/advice', require('./routes/advice.routes'));
app.use('/medicines', require('./routes/medicine.routes'));
app.use('/options', require('./routes/options.routes'));

app.use('/reports', require('./routes/report.routes'));

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'image'))); // <-- now works


 // Dynamic checkboxes
app.use('/', require('./routes/user.routes')); // login/signup

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
