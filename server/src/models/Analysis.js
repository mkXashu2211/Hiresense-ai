import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileName: { type: String, required: true },
  jobTitle: { type: String, default: 'Untitled role' },
  score: { type: Number, min: 0, max: 100, required: true },
  matchedSkills: [String],
  missingSkills: [String],
  preferredMissingSkills: [String],
  summary: String,
  suggestions: [String],
  resumeText: { type: String, select: false },
  jobDescription: { type: String, select: false }
}, { timestamps: true });

export default mongoose.model('Analysis', analysisSchema);
