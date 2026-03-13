require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const predictRoutes = require('./routes/predictRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// API Routes
console.log('Registering routes...');
app.use('/api', predictRoutes);
app.use('/api', uploadRoutes);
console.log('Routes registered.');

// Error Handling
app.use(errorHandler);

// Production Logging control
if (process.env.NODE_ENV === 'production') {
    console.log = () => { };
}

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Predict API: http://localhost:${PORT}/api/predict`);
});
