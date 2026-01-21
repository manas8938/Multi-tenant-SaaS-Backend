import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import { AuditLogJobData } from '../interfaces/job-data.interface';

@Injectable()
export class AuditLogProducer {
  private readonly logger = new Logger(AuditLogProducer.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.AUDIT_LOG)
    private readonly auditLogQueue: Queue,
  ) {}

  async log(data: AuditLogJobData) {
    this.logger.debug(`Queueing audit log: ${data.action} on ${data.resource}`);
    return this.auditLogQueue.add(JOB_NAMES.CREATE_AUDIT_LOG, data, {
      removeOnComplete: true,
    });
  }
}
