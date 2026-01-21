import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import { NotificationJobData } from '../interfaces/job-data.interface';

@Injectable()
export class NotificationProducer {
  private readonly logger = new Logger(NotificationProducer.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATION)
    private readonly notificationQueue: Queue,
  ) {}

  async createNotification(data: NotificationJobData) {
    this.logger.log(`Queueing notification for user ${data.userId}`);
    return this.notificationQueue.add(JOB_NAMES.CREATE_NOTIFICATION, data);
  }

  async sendBulkNotifications(notifications: NotificationJobData[]) {
    this.logger.log(`Queueing ${notifications.length} bulk notifications`);
    const jobs = notifications.map((data) => ({
      name: JOB_NAMES.CREATE_NOTIFICATION,
      data,
    }));
    return this.notificationQueue.addBulk(jobs);
  }
}
