require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');
const { predictColleges } = require('./controllers/predictController');

async function testQuery() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor');
    
    const req = {
        body: {
            percentile: "96.5",
            category: "OBC", // Backend should map to GOBC and LOBC
            gender: "Female", 
            branch: "Computer Science", // Backend should match "Computer Engineering"
            region: ""
        }
    };
    
    const res = {
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) {  
            console.log("Returned count:", data.count);
            console.log("Dream:", data.data.dream?.length || 0);
            console.log("Moderate:", data.data.moderate?.length || 0);
            console.log("Safe:", data.data.safe?.length || 0);
        }
    };

    const next = (err) => console.error("Error:", err);

    await predictColleges(req, res, next);
    process.exit(0);
}

testQuery();
