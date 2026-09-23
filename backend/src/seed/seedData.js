import { User } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';
import { RepairSubmission } from '../models/RepairSubmission.js';
import { AuditLog } from '../models/AuditLog.js';
import { ImageFingerprint } from '../models/ImageFingerprint.js';

export const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('[Seed] Database already seeded. Skipping initial seed.');
      return;
    }

    console.log('[Seed] Seeding realistic demo data for RoadProof hackathon...');

    // 1. Create Users
    const officer = await User.create({
      name: 'Sarah Jenkins',
      email: 'officer@roadproof.gov',
      passwordHash: 'password123',
      role: 'officer',
      organization: 'Metropolitan Public Works Department',
      phone: '+1 (555) 019-2831',
    });

    const contractor1 = await User.create({
      name: 'Marcus Vance',
      email: 'contractor@fixitroads.com',
      passwordHash: 'password123',
      role: 'contractor',
      organization: 'Apex Pavement & Asphalt Corp',
      phone: '+1 (555) 438-9920',
    });

    const contractor2 = await User.create({
      name: 'David Chen',
      email: 'contractor2@buildwell.com',
      passwordHash: 'password123',
      role: 'contractor',
      organization: 'QuickPatch Infrastructure',
      phone: '+1 (555) 774-1205',
    });

    const citizen = await User.create({
      name: 'Alex Rivera',
      email: 'citizen@citymail.com',
      passwordHash: 'password123',
      role: 'citizen',
      organization: 'Downtown Neighborhood Resident',
      phone: '+1 (555) 882-9011',
    });

    // High quality asphalt and pothole photos for realistic demo
    const imgPotholeSevere = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800';
    const imgRepairedSmooth = 'https://images.unsplash.com/photo-1584463699035-779872583856?w=800';
    const imgPotholeMedium = 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800';
    const imgPatchFresh = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800';

    // 2. Complaint 1: Just Reported (Needs Assignment)
    const complaint1 = await Complaint.create({
      complaintId: 'RP-2026-0001',
      reporter: citizen._id,
      title: 'Deep Hazardous Pothole Near Crosswalk',
      description: 'Dangerous depression in asphalt near crosswalk. Vehicles swerving into oncoming traffic to avoid rim damage.',
      severity: 'HIGH',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      address: '742 Market St, San Francisco, CA',
      status: 'REPORTED',
      beforeEvidence: {
        imageUrl: imgPotholeSevere,
        capturedAt: new Date(Date.now() - 3600000 * 48),
        coordinates: { lat: 37.7749, lng: -122.4194 },
        orientation: { heading: 145, tilt: -28 },
        perceptualHash: 'e0cc94b2a8c8cc9c',
      },
      timeline: [
        {
          status: 'REPORTED',
          title: 'Complaint Registered',
          description: 'Citizen Alex Rivera submitted high-priority report with GPS coordinates.',
          updatedBy: citizen._id,
          timestamp: new Date(Date.now() - 3600000 * 48),
        },
      ],
    });

    // 3. Complaint 2: Assigned to Contractor
    const complaint2 = await Complaint.create({
      complaintId: 'RP-2026-0002',
      reporter: citizen._id,
      title: 'Asphalt Deterioration & Edge Crack',
      description: 'Continuous asphalt decay along bus lane curb. Poses danger for cyclists and buses.',
      severity: 'MEDIUM',
      coordinates: { lat: 37.7833, lng: -122.4167 },
      address: '250 4th Ave, San Francisco, CA',
      status: 'ASSIGNED',
      assignedContractor: contractor1._id,
      assignedAt: new Date(Date.now() - 3600000 * 24),
      beforeEvidence: {
        imageUrl: imgPotholeMedium,
        capturedAt: new Date(Date.now() - 3600000 * 36),
        coordinates: { lat: 37.7833, lng: -122.4167 },
        orientation: { heading: 92, tilt: -32 },
        perceptualHash: 'f4ac33b9c7d1e2a0',
      },
      timeline: [
        {
          status: 'REPORTED',
          title: 'Complaint Registered',
          description: 'Citizen report logged.',
          updatedBy: citizen._id,
          timestamp: new Date(Date.now() - 3600000 * 36),
        },
        {
          status: 'ASSIGNED',
          title: 'Contractor Assigned',
          description: `Municipal Officer Sarah Jenkins assigned work to ${contractor1.name} (Apex Pavement).`,
          updatedBy: officer._id,
          timestamp: new Date(Date.now() - 3600000 * 24),
        },
      ],
    });

    // 4. Complaint 3: AI-VERIFIED Repair (Score: 88, Recommended: AUTO_APPROVE)
    const complaint3 = await Complaint.create({
      complaintId: 'RP-2026-0003',
      reporter: citizen._id,
      title: 'Large Crater on Mission St Intersection',
      description: 'Severe road surface hole approx 80cm wide, exposed aggregate.',
      severity: 'CRITICAL',
      coordinates: { lat: 37.7612, lng: -122.4201 },
      address: '1850 Mission St, San Francisco, CA',
      status: 'VERIFIED',
      assignedContractor: contractor1._id,
      assignedAt: new Date(Date.now() - 3600000 * 72),
      beforeEvidence: {
        imageUrl: imgPotholeSevere,
        capturedAt: new Date(Date.now() - 3600000 * 80),
        coordinates: { lat: 37.7612, lng: -122.4201 },
        orientation: { heading: 180, tilt: -30 },
        perceptualHash: 'a8b1c4d9e2f50011',
      },
      timeline: [
        {
          status: 'REPORTED',
          title: 'Complaint Registered',
          description: 'Severe crater logged.',
          updatedBy: citizen._id,
          timestamp: new Date(Date.now() - 3600000 * 80),
        },
        {
          status: 'ASSIGNED',
          title: 'Contractor Assigned',
          description: 'Work dispatched to Apex Pavement.',
          updatedBy: officer._id,
          timestamp: new Date(Date.now() - 3600000 * 72),
        },
        {
          status: 'VERIFIED',
          title: 'AI Verification Passed (Verified)',
          description: 'AI Verification Score: 88/100 [VERIFIED]. All biometric, GPS, and landmark checks satisfied.',
          updatedBy: contractor1._id,
          timestamp: new Date(Date.now() - 3600000 * 12),
        },
      ],
    });

    const submission3 = await RepairSubmission.create({
      complaint: complaint3._id,
      contractor: contractor1._id,
      afterEvidence: {
        imageUrl: imgRepairedSmooth,
        capturedAt: new Date(Date.now() - 3600000 * 12),
        coordinates: { lat: 37.76124, lng: -122.42008 }, // 5.2m away
        orientation: { heading: 192, tilt: -26 },         // 12 deg delta
        perceptualHash: '11005f2e9d4c1b8a',
      },
      captureMetadata: {
        deviceInfo: 'iPhone 15 Pro - Safari Mobile Sensor API',
        networkGpsAccuracyMeters: 3.8,
        headingAccuracyDegrees: 2.1,
      },
      verificationResult: {
        overallScore: 88,
        status: 'VERIFIED',
        recommendedAction: 'AUTO_APPROVE',
        reviewReason: null,
        checks: {
          gps: {
            score: 95,
            distanceMeters: 5.2,
            reason: 'Before and after evidence were captured at the same location (5.2m).',
          },
          landmarks: {
            score: 88,
            embeddingSimilarity: 0.89,
            featureMatches: 64,
            reason: 'Background road landmarks match.',
          },
          cameraAngle: {
            score: 82,
            headingDifference: 12.0,
            reason: 'Camera view is within the acceptable angle tolerance.',
          },
          potholeRepair: {
            score: 90,
            reason: 'The previously damaged road region appears repaired with fresh patch overlay.',
          },
          fraudDetection: {
            score: 100,
            flags: [],
          },
        },
      },
    });

    complaint3.latestSubmission = submission3._id;
    await complaint3.save();

    // 5. Complaint 4: FLAGGED (Fraud alert: GPS discrepancy & photo anomaly)
    const complaint4 = await Complaint.create({
      complaintId: 'RP-2026-0004',
      reporter: citizen._id,
      title: 'Pothole In Commercial Delivery Alley',
      description: 'Substantial dip in road bed causing truck axle jarring.',
      severity: 'MEDIUM',
      coordinates: { lat: 37.7891, lng: -122.4014 },
      address: '88 Howard St, San Francisco, CA',
      status: 'FLAGGED',
      assignedContractor: contractor2._id,
      assignedAt: new Date(Date.now() - 3600000 * 48),
      beforeEvidence: {
        imageUrl: imgPotholeMedium,
        capturedAt: new Date(Date.now() - 3600000 * 50),
        coordinates: { lat: 37.7891, lng: -122.4014 },
        orientation: { heading: 45, tilt: -30 },
        perceptualHash: 'ffff000011112222',
      },
      timeline: [
        {
          status: 'REPORTED',
          title: 'Complaint Registered',
          description: 'Report created.',
          updatedBy: citizen._id,
          timestamp: new Date(Date.now() - 3600000 * 50),
        },
        {
          status: 'ASSIGNED',
          title: 'Contractor Assigned',
          description: 'Assigned to QuickPatch.',
          updatedBy: officer._id,
          timestamp: new Date(Date.now() - 3600000 * 48),
        },
        {
          status: 'FLAGGED',
          title: 'AI Fraud Warning (Flagged)',
          description: 'AI Verification Score: 41/100 [FLAGGED]. Significant GPS mismatch (582m) and recycled photo detected.',
          updatedBy: contractor2._id,
          timestamp: new Date(Date.now() - 3600000 * 6),
        },
      ],
    });

    const submission4 = await RepairSubmission.create({
      complaint: complaint4._id,
      contractor: contractor2._id,
      afterEvidence: {
        imageUrl: imgPatchFresh,
        capturedAt: new Date(Date.now() - 3600000 * 6),
        coordinates: { lat: 37.7845, lng: -122.4055 }, // ~582m discrepancy!
        orientation: { heading: 220, tilt: -10 },
        perceptualHash: 'ffff000011112222', // Reused hash!
      },
      captureMetadata: {
        deviceInfo: 'Android Chrome 124 - Sensor Emulation',
        networkGpsAccuracyMeters: 18.0,
      },
      verificationResult: {
        overallScore: 41,
        status: 'FLAGGED',
        recommendedAction: 'MANUAL_INSPECTION_REQUIRED',
        reviewReason: 'Critical anomalies or potential fraud indicators detected. Requires manual inspection before any closure.',
        checks: {
          gps: {
            score: 15,
            distanceMeters: 582.4,
            reason: 'Severe GPS mismatch (582.4m). Images appear captured at different sites.',
          },
          landmarks: {
            score: 35,
            embeddingSimilarity: 0.38,
            featureMatches: 6,
            reason: 'Weak background landmark similarity (6 matches). Environmental context does not strongly match.',
          },
          cameraAngle: {
            score: 30,
            headingDifference: 175.0,
            reason: 'Opposite or highly divergent shooting perspective (175° heading difference).',
          },
          potholeRepair: {
            score: 84,
            reason: 'Road surface appears consistently resurfaced and restored.',
          },
          fraudDetection: {
            score: 10,
            flags: [
              'Significant GPS distance discrepancy (582.4m > threshold). Evidence appears captured at a different location.',
              'Submitted after-repair image matches an existing image fingerprint already registered in the system. Possible recycled photo fraud.',
            ],
          },
        },
      },
    });

    complaint4.latestSubmission = submission4._id;
    await complaint4.save();

    // 6. Complaint 5: Fully Closed with Citizen 5-Star Feedback
    const complaint5 = await Complaint.create({
      complaintId: 'RP-2026-0005',
      reporter: citizen._id,
      title: 'Pothole Fixed and Verified on 16th St',
      description: 'Vehicle jarring bump near transit stop.',
      severity: 'HIGH',
      coordinates: { lat: 37.7650, lng: -122.4190 },
      address: '3100 16th St, San Francisco, CA',
      status: 'CLOSED',
      assignedContractor: contractor1._id,
      assignedAt: new Date(Date.now() - 3600000 * 96),
      beforeEvidence: {
        imageUrl: imgPotholeSevere,
        capturedAt: new Date(Date.now() - 3600000 * 100),
        coordinates: { lat: 37.7650, lng: -122.4190 },
        orientation: { heading: 180, tilt: -30 },
        perceptualHash: 'cccc111122223333',
      },
      citizenFeedback: {
        rating: 5,
        comment: 'Incredible speed and completely transparent verification! Verified repair looks immaculate.',
        submittedAt: new Date(Date.now() - 3600000 * 4),
      },
      timeline: [
        {
          status: 'REPORTED',
          title: 'Complaint Registered',
          description: 'Citizen report logged.',
          updatedBy: citizen._id,
          timestamp: new Date(Date.now() - 3600000 * 100),
        },
        {
          status: 'ASSIGNED',
          title: 'Contractor Assigned',
          description: 'Assigned to Apex Pavement.',
          updatedBy: officer._id,
          timestamp: new Date(Date.now() - 3600000 * 96),
        },
        {
          status: 'VERIFIED',
          title: 'AI Verification Passed',
          description: 'AI Score: 92/100. Strong biometric and landmark match.',
          updatedBy: contractor1._id,
          timestamp: new Date(Date.now() - 3600000 * 18),
        },
        {
          status: 'CLOSED',
          title: 'Repair Officially Approved & Closed',
          description: 'Municipal Officer Sarah Jenkins approved repair following AI recommendation.',
          updatedBy: officer._id,
          timestamp: new Date(Date.now() - 3600000 * 8),
        },
        {
          status: 'CLOSED',
          title: 'Citizen Feedback Received',
          description: 'Alex Rivera rated repair 5/5 stars.',
          updatedBy: citizen._id,
          timestamp: new Date(Date.now() - 3600000 * 4),
        },
      ],
    });

    const submission5 = await RepairSubmission.create({
      complaint: complaint5._id,
      contractor: contractor1._id,
      afterEvidence: {
        imageUrl: imgRepairedSmooth,
        capturedAt: new Date(Date.now() - 3600000 * 18),
        coordinates: { lat: 37.76503, lng: -122.41902 },
        orientation: { heading: 185, tilt: -28 },
        perceptualHash: 'dddd444455556666',
      },
      captureMetadata: {
        deviceInfo: 'iPhone 14 - WebSensor API',
        networkGpsAccuracyMeters: 2.8,
      },
      verificationResult: {
        overallScore: 92,
        status: 'VERIFIED',
        recommendedAction: 'AUTO_APPROVE',
        reviewReason: null,
        checks: {
          gps: { score: 98, distanceMeters: 3.4, reason: 'Exact GPS location match (3.4m).' },
          landmarks: { score: 92, embeddingSimilarity: 0.94, featureMatches: 82, reason: 'Background road landmarks match.' },
          cameraAngle: { score: 88, headingDifference: 5.0, reason: 'Camera view angle is aligned closely.' },
          potholeRepair: { score: 92, reason: 'The previously damaged road region appears repaired with fresh patch overlay.' },
          fraudDetection: { score: 100, flags: [] },
        },
      },
      officerDecision: {
        action: 'APPROVED',
        officer: officer._id,
        notes: 'Quality inspection verified. Meets municipal standards.',
        decidedAt: new Date(Date.now() - 3600000 * 8),
      },
    });

    complaint5.latestSubmission = submission5._id;
    await complaint5.save();

    // 7. Seed Audit Logs
    await AuditLog.create([
      {
        actor: { userId: citizen._id, name: citizen.name, email: citizen.email, role: citizen.role },
        action: 'COMPLAINT_CREATED',
        complaint: complaint1._id,
        complaintId: complaint1.complaintId,
        metadata: { title: complaint1.title, severity: complaint1.severity },
        timestamp: new Date(Date.now() - 3600000 * 48),
      },
      {
        actor: { userId: officer._id, name: officer.name, email: officer.email, role: officer.role },
        action: 'CONTRACTOR_ASSIGNED',
        complaint: complaint3._id,
        complaintId: complaint3.complaintId,
        metadata: { contractor: contractor1.name },
        timestamp: new Date(Date.now() - 3600000 * 72),
      },
      {
        actor: { userId: contractor1._id, name: contractor1.name, email: contractor1.email, role: contractor1.role },
        action: 'REPAIR_EVIDENCE_SUBMITTED',
        complaint: complaint3._id,
        complaintId: complaint3.complaintId,
        metadata: { score: 88, status: 'VERIFIED' },
        timestamp: new Date(Date.now() - 3600000 * 12),
      },
      {
        actor: { userId: contractor2._id, name: contractor2.name, email: contractor2.email, role: contractor2.role },
        action: 'REPAIR_EVIDENCE_SUBMITTED',
        complaint: complaint4._id,
        complaintId: complaint4.complaintId,
        metadata: { score: 41, status: 'FLAGGED', flagsCount: 2 },
        timestamp: new Date(Date.now() - 3600000 * 6),
      },
      {
        actor: { userId: officer._id, name: officer.name, email: officer.email, role: officer.role },
        action: 'OFFICER_APPROVED',
        complaint: complaint5._id,
        complaintId: complaint5.complaintId,
        metadata: { notes: 'Approved for closure' },
        timestamp: new Date(Date.now() - 3600000 * 8),
      },
    ]);

    console.log('[Seed] Successfully seeded 4 demo accounts, 5 complaints across all stages, and audit logs!');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error.message);
  }
};
