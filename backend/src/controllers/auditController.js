import { AuditLog } from '../models/AuditLog.js';

export const getAuditLogs = async (req, res) => {
  try {
    const { complaintId, action, limit = 50 } = req.query;
    const filter = {};

    if (complaintId) {
      filter.complaintId = complaintId.toUpperCase();
    }

    if (action) {
      filter.action = action;
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
