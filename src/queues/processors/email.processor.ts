import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import { EmailService } from '../../modules/email/email.service';
import {
  WelcomeEmailJobData,
  InvitationEmailJobData,
} from '../interfaces/job-data.interface';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing email job: ${job.name} (${job.id})`);

    try {
      switch (job.name) {
        case JOB_NAMES.SEND_WELCOME_EMAIL:
          await this.handleWelcomeEmail(job.data as WelcomeEmailJobData);
          break;
        case JOB_NAMES.SEND_INVITATION_EMAIL:
          await this.handleInvitationEmail(job.data as InvitationEmailJobData);
          break;
        case JOB_NAMES.SEND_PASSWORD_RESET_EMAIL:
          await this.handlePasswordResetEmail(job.data);
          break;
        default:
          this.logger.warn(`Unknown email job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process email job: ${job.name}`, error);
      throw error;
    }
  }

  private async handleWelcomeEmail(data: WelcomeEmailJobData) {
    this.logger.log(`Sending welcome email to ${data.email}`);
    // Email service handles the actual sending
    await this.emailService.sendWelcomeEmail(
      data.email,
      data.firstName,
      data.lastName,
    );
  }

  private async handleInvitationEmail(data: InvitationEmailJobData) {
    this.logger.log(`Sending invitation email to ${data.email}`);
    await this.emailService.sendInvitationEmail(
      data.email,
      data.inviterName,
      data.tenantName,
      data.invitationToken,
    );
  }

  private async handlePasswordResetEmail(data: { email: string; resetToken: string }) {
    this.logger.log(`Sending password reset email to ${data.email}`);
    await this.emailService.sendPasswordResetEmail(data.email, data.resetToken);
  }
}
