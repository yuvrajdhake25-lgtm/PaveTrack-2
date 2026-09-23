import mongoose from 'mongoose';

const imageFingerprintSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    relatedComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },
    submissionType: {
      type: String,
      enum: ['BEFORE', 'AFTER'],
      required: true,
    },
    capturedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

imageFingerprintSchema.index({ hash: 1 });

export const ImageFingerprint = mongoose.model(
  'ImageFingerprint',
  imageFingerprintSchema
);
