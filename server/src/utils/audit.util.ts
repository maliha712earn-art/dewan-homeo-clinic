import prisma from '../config/db';

export async function logAdminAction(params: {
  adminId?: string;
  adminEmail?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
}) {
  try {
    const detailsString = params.details ? (typeof params.details === 'string' ? params.details : JSON.stringify(params.details)) : null;
    await prisma.auditLog.create({
      data: {
        adminId: params.adminId || null,
        adminEmail: params.adminEmail || null,
        action: params.action,
        targetType: params.targetType || null,
        targetId: params.targetId || null,
        details: detailsString,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
