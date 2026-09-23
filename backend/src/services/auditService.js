import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({
  actor,
  action,
  complaint = null,
  complaintId = null,
  metadata = {},
  req = null,
}) => {
  try {
    let ipAddress = '127.0.0.1';
    if (req) {
      ipAddress =
        req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.ip ||
        '127.0.0.1';
    }

    const logEntry = new AuditLog({
      actor: {
        userId: actor?._id || actor?.id || null,
        name: actor?.name || 'System',
        email: actor?.email || 'system@roadproof.gov',
        role: actor?.role || 'system',
      },
      action,
      complaint: complaint?._id || complaint || null,
      complaintId: complaintId || complaint?.complaintId || null,
      metadata,
      ipAddress,
      timestamp: new Date(),
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('[AuditService] Failed to record audit log:', error.message);
    return null;
  }
};
