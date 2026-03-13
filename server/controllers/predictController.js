const Cutoff = require('../models/Cutoff');

// Map of high-level category names to granular MHT-CET category codes
const CATEGORY_MAP = {
    'OPEN': ['GOPENO', 'GOPENH', 'LOPENO', 'LOPENH', 'GOPENS', 'GOPEN'],
    'OBC': ['GOBCO', 'GOBCH', 'LOBCO', 'LOBCH', 'GOBCS', 'GOBC'],
    'SC': ['GSCO', 'GSCH', 'LSCO', 'LSCH', 'GSCS', 'GSC', 'LSC'],
    'ST': ['GSTO', 'GSTH', 'LSTO', 'LSTH', 'GSTS', 'GST', 'LST'],
    'VJ': ['GVJO', 'GVJH', 'LVJO', 'LVJH', 'GVJS', 'GVJ', 'LVJ', 'VJ', 'VJDT'],
    'NT1': ['GNT1O', 'GNT1H', 'LNT1O', 'LNT1H', 'GNT1S', 'NT1'],
    'NT2': ['GNT2O', 'GNT2H', 'LNT2O', 'LNT2H', 'GNT2S', 'NT2'],
    'NT3': ['GNT3O', 'GNT3H', 'LNT3O', 'LNT3H', 'GNT3S', 'NT3'],
    'EWS': ['EWS'],
    'TFWS': ['TFWS']
};

/**
 * Predict Colleges based on percentile and filters
 */
exports.predictColleges = async (req, res, next) => {
    try {
        const { percentile, branch, preferredBranch, category, region } = req.body;

        if (!percentile || !category) {
            return res.status(400).json({ success: false, message: 'Percentile and Category are required.' });
        }

        const uPercentile = parseFloat(percentile);
        const minPercentile = uPercentile - 1.5;
        const maxPercentile = uPercentile + 1.5;

        // 1. Build Query Base
        const mappedCodes = CATEGORY_MAP[category] || [category];
        
        const query = {
            percentile: { $gte: minPercentile, $lte: maxPercentile },
            categoryCode: { $in: mappedCodes }
        };

        // 2. Region Filter (Explicit Mapping + City Fallback)
        if (region && region.trim() !== '' && !['All Regions', ''].includes(region)) {
            const regionMapping = {
                'Pune Region': 'Western Maharashtra',
                'Western Maharashtra (Pune/Kolhapur)': 'Western Maharashtra',
                'Konkan (Mumbai/Thane/Ratnagiri)': 'Konkan',
                'Vidarbha (Nagpur/Amravati)': 'Vidarbha',
                'Marathwada (Aurangabad/Nanded)': 'Marathwada',
                'Khandesh (Nashik/Jalgaon)': 'Khandesh'
            };

            const dbRegion = regionMapping[region] || region.split('(')[0].trim();
            
            // Refined search: Look for the region label OR cities that belong to that region if records are marked 'Other'
            const regionConditions = [{ region: dbRegion }];
            
            // Add city fallback for miscategorized records (COEP, VJTI, etc.)
            if (dbRegion === 'Western Maharashtra') {
                regionConditions.push({ region: 'Other', city: /Pune|Ahmednagar|Solapur|Satara|Sangli|Kolhapur|COEP/i });
            } else if (dbRegion === 'Konkan') {
                regionConditions.push({ region: 'Other', city: /Mumbai|Thane|Raigad|Ratnagiri|Sindhudurg/i });
            } else if (dbRegion === 'Vidarbha') {
                regionConditions.push({ region: 'Other', city: /Nagpur|Amravati|Akola|Yavatmal|Wardha|Buldhana|Washim|Chandrapur|Gadchiroli|Gondia|Bhandara/i });
            }
            
            query.$or = regionConditions;
            console.log("Region Filter Applied (Mapping + City Fallback):", dbRegion);
        }

        // 3. Strict Branch Filtering Logic
        const selectedBranch = preferredBranch || branch;
        if (selectedBranch && selectedBranch.trim() !== '' && !['All Branches', '', 'null'].includes(selectedBranch)) {
            let branchConditions = [];
            const searchBranch = selectedBranch.toLowerCase();
            
            if (searchBranch.includes('computer') || searchBranch.includes('cse')) {
                // Allowed: Computer Engineering, Computer Science, Computer Science and Engineering, CSE
                // NOT allowed: AI, ML, DS, IT, Electronics, etc.
                branchConditions.push({ branch: { $regex: /computer|cse/i } });
                branchConditions.push({ branch: { $not: /artificial intelligence|\bai\b|data science|\bds\b|machine learning|learning|information technology|\bit\b|electronics/i } });
            } else if (searchBranch.includes('information technology') || searchBranch === 'it') {
                // Allowed: Information Technology, IT
                // NOT allowed: Computer Science hybrids
                branchConditions.push({ branch: { $regex: /information technology|\bit\b/i } });
                branchConditions.push({ branch: { $not: /computer|science|engineering/i } });
            } else if (searchBranch.includes('mechanical')) {
                branchConditions.push({ branch: { $regex: /mechanical/i } });
            } else if (searchBranch.includes('civil')) {
                branchConditions.push({ branch: { $regex: /civil/i } });
            } else if (searchBranch.includes('electrical')) {
                branchConditions.push({ branch: { $regex: /electrical/i } });
            } else {
                // For any other branch, use exact case-insensitive match or standard regex
                branchConditions.push({ branch: { $regex: new RegExp(`^${selectedBranch}$`, 'i') } });
            }

            if (branchConditions.length > 0) {
                if (branchConditions.length === 1) {
                    query.branch = branchConditions[0].branch;
                } else {
                    // Use $and to combine all conditions
                    query.$and = (query.$and || []).concat(branchConditions);
                }
            }
            console.log("Branch Filter Applied (Strict Global):", selectedBranch);
        }

        console.log("Final Mongo Query:", JSON.stringify(query, null, 2));

        // 4. Fetch data
        const results = await Cutoff.find(query)
            .sort({ percentile: -1 })
            .lean();

        console.log(`Results found: ${results.length}`);

        // 5. Classify results
        const classifiedResults = results.map(item => {
            const cutoff = item.percentile;
            let status = 'MODERATE';
            
            if (cutoff <= uPercentile - 0.5) {
                status = 'SAFE';
            } else if (cutoff >= uPercentile + 0.5) {
                status = 'DREAM';
            }

            return {
                ...item,
                status
            };
        });

        return res.status(200).json({
            success: true,
            count: classifiedResults.length,
            data: classifiedResults
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get all unique branches for the dropdown
 */
exports.getBranches = async (req, res, next) => {
    try {
        const branches = await Cutoff.distinct('branch');
        const sortedBranches = branches.sort();
        
        return res.status(200).json({
            success: true,
            count: sortedBranches.length,
            data: sortedBranches
        });
    } catch (error) {
        next(error);
    }
};

