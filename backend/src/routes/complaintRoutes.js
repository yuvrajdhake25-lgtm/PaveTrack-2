import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignContractor,
  submitRepairEvidence,
  recordOfficerDecision,
  submitCitizenFeedback,
  getContractors,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getComplaints);
router.get('/contractors', protect, authorize('officer', 'contractor'), getContractors);
router.get('/:id', getComplaintById);

router.post('/', protect, upload.single('image'), createComplaint);

router.patch(
  '/:id/assign',
  protect,
  authorize('officer'),
  assignContractor
);

router.post(
  '/:id/repair',
  protect,
  authorize('contractor', 'officer'),
  upload.single('image'),
  submitRepairEvidence
);

router.patch(
  '/:id/decision',
  protect,
  authorize('officer'),
  recordOfficerDecision
);

router.post(
  '/:id/feedback',
  protect,
  authorize('citizen', 'officer'),
  submitCitizenFeedback
);

export default router;
