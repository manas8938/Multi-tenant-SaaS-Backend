import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import { PrismaService } from '../../database/prisma.service';
import { NotificationJobData } from '../interfaces/job-data.interface';
import { NotificationType } from '@prisma/client';

@Processor(QUEUE_NAMES.NOTIFICATION)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing notification job: ${job.name} (${job.id})`);

    try {
      switch (job.name) {
        case JOB_NAMES.CREATE_NOTIFICATION:
          await this.createNotification(job.data as NotificationJobData);
          break;
        default:
          this.logger.warn(`Unknown notification job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process notification job: ${job.name}`, error);
      throw error;
    }
  }

  private async createNotification(data: NotificationJobData) {
    await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as NotificationType,
        title: data.title,
        content: data.message,
        data: data.data || {},
      },
    });
    this.logger.log(`Created notification for user ${data.userId}`);
  }
}
