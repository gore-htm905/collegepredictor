require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function findColleges() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        
        const colleges = await Cutoff.find({
            instituteName: { $regex: /Sardar|Thadomal|Sanghvi|Somaiya/i }
        }).select('instituteCode instituteName').limit(20).lean();

        console.log("Colleges found:");
        const uniqueColleges = Array.from(new Set(colleges.map(c => `${c.instituteCode} | ${c.instituteName}`)));
        uniqueColleges.forEach(c => console.log(c));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

findColleges();
