import mongoose from 'mongoose';

const repairSubmissionSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    afterEvidence: {
      imageUrl: { type: String, required: true },
      capturedAt: { type: Date, default: Date.now },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
      orientation: {
        heading: { type: Number, default: 0 },
        tilt: { type: Number, default: -30 },
      },
      perceptualHash: { type: String },
    },
    captureMetadata: {
      deviceInfo: { type: String },
      networkGpsAccuracyMeters: { type: Number },
      headingAccuracyDegrees: { type: Number },
      ambientLightLux: { type: Number },
    },
    verificationResult: {
      overallScore: { type: Number, required: true },
      status: {
        type: String,
        enum: ['VERIFIED', 'NEEDS_REVIEW', 'FLAGGED'],
        required: true,
      },
      recommendedAction: {
        type: String,
        enum: ['AUTO_APPROVE', 'OFFICER_REVIEW', 'MANUAL_INSPECTION_REQUIRED'],
        required: true,
      },
      reviewReason: { type: String, default: null },
      checks: {
        gps: {
          score: Number,
          distanceMeters: Number,
          reason: String,
        },
        landmarks: {
          score: Number,
          embeddingSimilarity: Number,
          featureMatches: Number,
          reason: String,
        },
        cameraAngle: {
          score: Number,
          headingDifference: Number,
          reason: String,
        },
        potholeRepair: {
          score: Number,
          reason: String,
        },
        fraudDetection: {
          score: Number,
          flags: [String],
        },
      },
    },
    officerDecision: {
      action: {
        type: String,
        enum: ['APPROVED', 'REJECTED', 'REWORK_REQUESTED'],
        default: null,
      },
      officer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      notes: { type: String, default: '' },
      decidedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

export const RepairSubmission = mongoose.model(
  'RepairSubmission',
  repairSubmissionSchema
);
