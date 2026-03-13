const mongoose = require('mongoose');

const cutoffSchema = new mongoose.Schema({
  instituteCode: { type: String, required: true },
  instituteName: { type: String, required: true },
  branch: { type: String, required: true },
  categoryCode: { type: String, required: true },
  percentile: { type: Number, required: true },
  city: { type: String, required: true },
  region: { type: String, required: true },
  capRound: { type: Number, default: 1 },
  year: { type: Number, default: 2024 }
}, { timestamps: true });

// Optimize indexes for predictor queries
cutoffSchema.index({ percentile: -1 });
cutoffSchema.index({ categoryCode: 1 });
cutoffSchema.index({ region: 1 });
cutoffSchema.index({ branch: 'text', instituteName: 'text' });
cutoffSchema.index({ categoryCode: 1, percentile: -1 });

module.exports = mongoose.model('Cutoff', cutoffSchema);
