import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import {
  WelcomeEmailJobData,
  InvitationEmailJobData,
} from '../interfaces/job-data.interface';

@Injectable()
export class EmailProducer {
  private readonly logger = new Logger(EmailProducer.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL)
    private readonly emailQueue: Queue,
  ) {}

  async sendWelcomeEmail(data: WelcomeEmailJobData) {
    this.logger.log(`Queueing welcome email for ${data.email}`);
    return this.emailQueue.add(JOB_NAMES.SEND_WELCOME_EMAIL, data, {
      priority: 1,
    });
  }

  async sendInvitationEmail(data: InvitationEmailJobData) {
    this.logger.log(`Queueing invitation email for ${data.email}`);
    return this.emailQueue.add(JOB_NAMES.SEND_INVITATION_EMAIL, data, {
      priority: 1,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    this.logger.log(`Queueing password reset email for ${email}`);
    return this.emailQueue.add(
      JOB_NAMES.SEND_PASSWORD_RESET_EMAIL,
      { email, resetToken },
      { priority: 1 },
    );
  }
}
