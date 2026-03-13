require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function checkCategories() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        const categories = await Cutoff.distinct('categoryCode');
        console.log('Unique category codes count:', categories.length);
        console.log('Sample category codes:', categories.slice(0, 20));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkCategories();
