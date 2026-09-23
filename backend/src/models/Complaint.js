import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'REPORTED',
        'ASSIGNED',
        'IN_PROGRESS',
        'VERIFIED',
        'NEEDS_REVIEW',
        'FLAGGED',
        'REWORK_REQUESTED',
        'CLOSED',
      ],
      default: 'REPORTED',
    },
    beforeEvidence: {
      imageUrl: { type: String, required: true },
      capturedAt: { type: Date, default: Date.now },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      orientation: {
        heading: { type: Number, default: 0 },
        tilt: { type: Number, default: -30 },
      },
      perceptualHash: { type: String },
    },
    assignedContractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    latestSubmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RepairSubmission',
      default: null,
    },
    timeline: [
      {
        status: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    citizenFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      submittedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ assignedContractor: 1 });

export const Complaint = mongoose.model('Complaint', complaintSchema);
