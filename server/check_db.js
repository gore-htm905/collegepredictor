require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function checkDb() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const count = await Cutoff.countDocuments();
        console.log('Total records in Cutoff:', count);
        
        if (count > 0) {
            const branches = await Cutoff.distinct('branch');
            console.log('Unique branches count:', branches.length);
            console.log('Sample branches:', branches.slice(0, 10));
        } else {
            console.log('No records found in Cutoff collection.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkDb();
