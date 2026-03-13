require('dotenv').config();
const express = require('express');
const cors = require('cors');

const predictRoutes = require('./routes/predictRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
    res.send("MHT CET College Predictor Backend Running");
});

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api', predictRoutes);
app.use('/api', uploadRoutes);

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});