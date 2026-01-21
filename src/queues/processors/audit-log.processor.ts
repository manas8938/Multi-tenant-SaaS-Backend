import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogJobData } from '../interfaces/job-data.interface';
import { AuditAction } from '@prisma/client';

@Processor(QUEUE_NAMES.AUDIT_LOG)
export class AuditLogProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditLogProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing audit log job: ${job.name} (${job.id})`);

    try {
      switch (job.name) {
        case JOB_NAMES.CREATE_AUDIT_LOG:
          await this.createAuditLog(job.data as AuditLogJobData);
          break;
        default:
          this.logger.warn(`Unknown audit log job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process audit log job: ${job.name}`, error);
      throw error;
    }
  }

  private async createAuditLog(data: AuditLogJobData) {
    await this.prisma.auditLog.create({
      data: {
        userId: data.userId ?? null,
        tenantId: data.tenantId ?? null,
        action: data.action as AuditAction,
        entityType: data.resource,       // map resource → entityType
        entityId: data.resourceId ?? null,
        oldValues: data.oldData || {},
        newValues: data.newData || {},
        metadata: {},                    // you can add extra info here if needed
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
    this.logger.debug(`Created audit log: ${data.action} on ${data.resource}`);
  }
}
