import { Complaint } from '../models/Complaint.js';
import { RepairSubmission } from '../models/RepairSubmission.js';
import { ImageFingerprint } from '../models/ImageFingerprint.js';
import { User } from '../models/User.js';
import { saveImageFile } from '../config/cloudinary.js';
import { logAudit } from '../services/auditService.js';
import { requestAIVerification } from '../services/aiVerificationService.js';

// Helper to generate readable complaint ID: RP-2026-XXXX
const generateComplaintId = async () => {
  const count = await Complaint.countDocuments();
  const year = new Date().getFullYear();
  const serial = String(count + 1).padStart(4, '0');
  return `RP-${year}-${serial}`;
};

export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      severity,
      lat,
      lng,
      address,
      heading,
      tilt,
    } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Valid GPS coordinates (latitude and longitude) are required',
      });
    }

    if (!title || !description || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and street address',
      });
    }

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = await saveImageFile(req.file, req);
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'A clear photo of the pothole damage is required',
      });
    }

    const complaintId = await generateComplaintId();

    const complaint = new Complaint({
      complaintId,
      reporter: req.user._id,
      title,
      description,
      severity: severity || 'MEDIUM',
      coordinates: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      address,
      status: 'REPORTED',
      beforeEvidence: {
        imageUrl,
        capturedAt: new Date(),
        coordinates: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
        orientation: {
          heading: heading ? parseFloat(heading) : 145,
          tilt: tilt ? parseFloat(tilt) : -30,
        },
        perceptualHash: 'init_hash_' + Math.random().toString(36).substring(7),
      },
      timeline: [
        {
          status: 'REPORTED',
          title: 'Complaint Registered',
          description: `Pothole reported at ${address} with GPS coordinates (${lat}, ${lng}).`,
          updatedBy: req.user._id,
          timestamp: new Date(),
        },
      ],
    });

    await complaint.save();

    // Register image fingerprint
    try {
      await ImageFingerprint.create({
        imageUrl,
        hash: complaint.beforeEvidence.perceptualHash,
        relatedComplaint: complaint._id,
        submissionType: 'BEFORE',
      });
    } catch (e) {
      console.warn('Fingerprint registration skipped:', e.message);
    }

    // Record audit log
    await logAudit({
      actor: req.user,
      action: 'COMPLAINT_CREATED',
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      metadata: { title, severity, coordinates: { lat, lng } },
      req,
    });

    res.status(201).json({
      success: true,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const { status, severity, contractorId, search } = req.query;
    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (severity && severity !== 'ALL') {
      filter.severity = severity;
    }

    if (contractorId) {
      filter.assignedContractor = contractorId;
    }

    if (search) {
      filter.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('reporter', 'name email')
      .populate('assignedContractor', 'name email organization phone')
      .populate('latestSubmission')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    let complaint;

    if (id.startsWith('RP-')) {
      complaint = await Complaint.findOne({ complaintId: id.toUpperCase() })
        .populate('reporter', 'name email')
        .populate('assignedContractor', 'name email organization phone')
        .populate({
          path: 'latestSubmission',
          populate: { path: 'officerDecision.officer', select: 'name email' },
        })
        .populate('timeline.updatedBy', 'name role');
    } else {
      complaint = await Complaint.findById(id)
        .populate('reporter', 'name email')
        .populate('assignedContractor', 'name email organization phone')
        .populate({
          path: 'latestSubmission',
          populate: { path: 'officerDecision.officer', select: 'name email' },
        })
        .populate('timeline.updatedBy', 'name role');
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Get all repair submissions history for this complaint
    const submissions = await RepairSubmission.find({ complaint: complaint._id })
      .populate('contractor', 'name email organization')
      .populate('officerDecision.officer', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaint,
      submissions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignContractor = async (req, res) => {
  try {
    const { id } = req.params;
    const { contractorId, instructions } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const contractor = await User.findById(contractorId);
    if (!contractor || contractor.role !== 'contractor') {
      return res.status(400).json({
        success: false,
        message: 'Valid contractor user ID required',
      });
    }

    complaint.assignedContractor = contractor._id;
    complaint.assignedAt = new Date();
    complaint.status = 'ASSIGNED';
    complaint.timeline.push({
      status: 'ASSIGNED',
      title: 'Contractor Assigned',
      description: `Assigned to ${contractor.name} (${contractor.organization || 'Contractor Agency'}). ${instructions || ''}`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await complaint.save();

    await logAudit({
      actor: req.user,
      action: 'CONTRACTOR_ASSIGNED',
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      metadata: { contractorId: contractor._id, contractorName: contractor.name },
      req,
    });

    res.json({
      success: true,
      message: `Complaint assigned to ${contractor.name}`,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitRepairEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lat,
      lng,
      heading,
      tilt,
      deviceInfo,
      gpsAccuracy,
    } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Ensure user is the assigned contractor or officer
    if (
      req.user.role === 'contractor' &&
      complaint.assignedContractor?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit repair evidence for complaints assigned to you',
      });
    }

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = await saveImageFile(req.file, req);
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'After-repair evidence image is required',
      });
    }

    // Query existing image fingerprints for duplicate detection
    const existingPrints = await ImageFingerprint.find({
      relatedComplaint: { $ne: complaint._id },
    }).limit(100);
    const existingHashes = existingPrints.map((p) => p.hash);

    // Call AI verification service
    const verificationResult = await requestAIVerification({
      complaintId: complaint.complaintId,
      beforeImageUrl: complaint.beforeEvidence.imageUrl,
      afterImageUrl: imageUrl,
      beforeMetadata: {
        capturedAt: complaint.beforeEvidence.capturedAt.toISOString(),
        coordinates: complaint.beforeEvidence.coordinates,
        orientation: complaint.beforeEvidence.orientation,
      },
      afterMetadata: {
        capturedAt: new Date().toISOString(),
        coordinates: {
          lat: parseFloat(lat || complaint.coordinates.lat),
          lng: parseFloat(lng || complaint.coordinates.lng),
        },
        orientation: {
          heading: heading ? parseFloat(heading) : 158,
          tilt: tilt ? parseFloat(tilt) : -25,
        },
      },
      complaintCreatedAt: complaint.createdAt.toISOString(),
      contractorAssignedAt: complaint.assignedAt?.toISOString() || complaint.createdAt.toISOString(),
      existingPerceptualHashes: existingHashes,
    });

    const submission = new RepairSubmission({
      complaint: complaint._id,
      contractor: req.user._id,
      afterEvidence: {
        imageUrl,
        capturedAt: new Date(),
        coordinates: {
          lat: parseFloat(lat || complaint.coordinates.lat),
          lng: parseFloat(lng || complaint.coordinates.lng),
        },
        orientation: {
          heading: heading ? parseFloat(heading) : 158,
          tilt: tilt ? parseFloat(tilt) : -25,
        },
        perceptualHash: verificationResult.computedHashes?.after || 'after_hash_' + Date.now(),
      },
      captureMetadata: {
        deviceInfo: deviceInfo || 'Mobile Web Sensor API',
        networkGpsAccuracyMeters: gpsAccuracy ? parseFloat(gpsAccuracy) : 4.5,
      },
      verificationResult,
    });

    await submission.save();

    // Update Complaint with latest submission and status
    complaint.latestSubmission = submission._id;
    complaint.status = verificationResult.status; // 'VERIFIED' | 'NEEDS_REVIEW' | 'FLAGGED'

    let timelineTitle = 'Repair Evidence Submitted';
    let timelineDesc = `AI Verification Score: ${verificationResult.overallScore}/100 [${verificationResult.status}]. Recommended Action: ${verificationResult.recommendedAction}.`;

    if (verificationResult.status === 'VERIFIED') {
      timelineTitle = 'AI Verification Passed (Verified)';
    } else if (verificationResult.status === 'FLAGGED') {
      timelineTitle = 'AI Fraud Warning (Flagged)';
      timelineDesc += ` Detected flags: ${verificationResult.checks.fraudDetection.flags.join('; ')}`;
    } else {
      timelineTitle = 'AI Verification Under Review (Needs Review)';
    }

    complaint.timeline.push({
      status: verificationResult.status,
      title: timelineTitle,
      description: timelineDesc,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await complaint.save();

    // Register image fingerprint
    try {
      await ImageFingerprint.create({
        imageUrl,
        hash: submission.afterEvidence.perceptualHash,
        relatedComplaint: complaint._id,
        submissionType: 'AFTER',
      });
    } catch (e) {
      console.warn('Fingerprint registration skipped:', e.message);
    }

    // Log audit
    await logAudit({
      actor: req.user,
      action: 'REPAIR_EVIDENCE_SUBMITTED',
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      metadata: {
        score: verificationResult.overallScore,
        status: verificationResult.status,
        recommendedAction: verificationResult.recommendedAction,
        flags: verificationResult.checks.fraudDetection.flags,
      },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Repair evidence submitted and AI analyzed successfully',
      submission,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordOfficerDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // 'APPROVED' | 'REJECTED' | 'REWORK_REQUESTED'

    if (!['APPROVED', 'REJECTED', 'REWORK_REQUESTED'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be APPROVED, REJECTED, or REWORK_REQUESTED',
      });
    }

    const complaint = await Complaint.findById(id).populate('latestSubmission');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    let newStatus;
    let timelineTitle;
    if (action === 'APPROVED') {
      newStatus = 'CLOSED';
      timelineTitle = 'Repair Officially Approved & Closed';
    } else if (action === 'REJECTED') {
      newStatus = 'FLAGGED';
      timelineTitle = 'Repair Rejected by Municipal Officer';
    } else {
      newStatus = 'REWORK_REQUESTED';
      timelineTitle = 'Rework Requested by Municipal Officer';
    }

    complaint.status = newStatus;

    if (complaint.latestSubmission) {
      const submission = await RepairSubmission.findById(complaint.latestSubmission._id);
      if (submission) {
        submission.officerDecision = {
          action,
          officer: req.user._id,
          notes: notes || '',
          decidedAt: new Date(),
        };
        await submission.save();
      }
    }

    complaint.timeline.push({
      status: newStatus,
      title: timelineTitle,
      description: `Municipal Officer ${req.user.name}: ${notes || 'No extra notes provided.'}`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await complaint.save();

    await logAudit({
      actor: req.user,
      action: `OFFICER_${action}`,
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      metadata: { action, notes, officerName: req.user.name },
      req,
    });

    res.json({
      success: true,
      message: `Decision '${action}' successfully applied to complaint`,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitCitizenFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.status !== 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted after the complaint is officially closed',
      });
    }

    complaint.citizenFeedback = {
      rating: Math.min(5, Math.max(1, parseInt(rating || 5))),
      comment: comment || '',
      submittedAt: new Date(),
    };

    complaint.timeline.push({
      status: 'CLOSED',
      title: 'Citizen Feedback Received',
      description: `Citizen rated repair quality: ${rating}/5 stars. "${comment || ''}"`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await complaint.save();

    await logAudit({
      actor: req.user,
      action: 'CITIZEN_FEEDBACK_SUBMITTED',
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      metadata: { rating, comment },
      req,
    });

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      citizenFeedback: complaint.citizenFeedback,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContractors = async (req, res) => {
  try {
    const contractors = await User.find({ role: 'contractor' }).select(
      'name email organization phone'
    );

    // Attach current active jobs count
    const contractorsWithJobs = await Promise.all(
      contractors.map(async (c) => {
        const activeCount = await Complaint.countDocuments({
          assignedContractor: c._id,
          status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'NEEDS_REVIEW', 'REWORK_REQUESTED'] },
        });
        return {
          ...c.toObject(),
          activeJobs: activeCount,
        };
      })
    );

    res.json({
      success: true,
      contractors: contractorsWithJobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
