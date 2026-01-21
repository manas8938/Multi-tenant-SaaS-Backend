import { AuditAction } from '@prisma/client';

export class CreateAuditLogDto {
  action!: AuditAction;
  entityType!: string;
  entityId?: string | null;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  userId?: string | null;
  tenantId?: string | null;
}
