const fs = require('fs');
const csv = require('csv-parser');
const Cutoff = require('../models/Cutoff');

exports.uploadCutoffs = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error("Please upload a CSV file");
        }

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                // Clean and prepare data
                results.push({
                    instituteCode: data.instituteCode,
                    instituteName: data.instituteName,
                    branch: data.branch,
                    category: data.category,
                    gender: data.gender || 'G',
                    percentile: parseFloat(data.percentile),
                    capRound: parseInt(data.capRound) || 1
                });
            })
            .on('end', async () => {
                try {
                    if (results.length > 0) {
                        // Optional: await Cutoff.deleteMany({}); // Uncomment to clear before upload
                        await Cutoff.insertMany(results);
                    }

                    // Delete temp file
                    fs.unlinkSync(req.file.path);

                    res.json({
                        success: true,
                        message: `Successfully imported ${results.length} records`,
                    });
                } catch (err) {
                    next(err);
                }
            })
            .on('error', (err) => next(err));

    } catch (error) {
        next(error);
    }
};
