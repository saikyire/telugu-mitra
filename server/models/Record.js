import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  originalEntry: { type: String, required: true },
  term: { type: String, required: true },
  meaning: { type: String, required: true },
  normalizedTerm: { type: String },
  normalizedMeaning: { type: String },
  status: { type: String, required: true }, // e.g., 'UNIQUE', 'EXACT_DUPLICATE', 'FORMATTING_DUPLICATE'
  duplicateOfId: { type: String },
  duplicateType: { type: String }
}, { timestamps: true });

// Export History Schema (optional, groups records together)
const exportSessionSchema = new mongoose.Schema({
  filename: { type: String, required: true, index: true },
  originalRecords: { type: Number, required: true },
  duplicatesRemoved: { type: Number, required: true },
  finalCleanRecords: { type: Number, required: true },
  records: [recordSchema] // Embedded records for this specific upload
}, { timestamps: true });

// Add descending index on createdAt for faster history queries
exportSessionSchema.index({ createdAt: -1 });

const ExportSession = mongoose.model('ExportSession', exportSessionSchema);

export { ExportSession };
