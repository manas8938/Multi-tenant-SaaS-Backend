import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
    this.loadTemplates();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('MAIL_HOST', 'smtp.mailtrap.io');
    const port = this.configService.get<number>('MAIL_PORT', 587);
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });

    this.logger.log(`Email transporter initialized: ${host}:${port}`);
  }

  private loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');
    
    if (!fs.existsSync(templatesDir)) {
      this.logger.warn('Templates directory not found, using inline templates');
      return;
    }

    const templateFiles = fs.readdirSync(templatesDir).filter(f => f.endsWith('.hbs'));
    
    for (const file of templateFiles) {
      const templateName = path.basename(file, '.hbs');
      const templatePath = path.join(templatesDir, file);
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      this.templates.set(templateName, Handlebars.compile(templateContent));
      this.logger.log(`Loaded email template: ${templateName}`);
    }
  }

  private getTemplate(name: string): Handlebars.TemplateDelegate {
    const template = this.templates.get(name);
    if (!template) {
      // Return a simple fallback template
      return Handlebars.compile(`
        <html>
          <body>
            <h1>{{title}}</h1>
            <p>{{message}}</p>
          </body>
        </html>
      `);
    }
    return template;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const from = this.configService.get<string>('MAIL_FROM', 'noreply@saas-app.com');

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string, lastName?: string): Promise<void> {
    const template = this.getTemplate('welcome');
    const html = template({
      title: 'Welcome to Our Platform!',
      firstName,
      lastName,
      message: `Hello ${firstName}, welcome to our SaaS platform!`,
      loginUrl: this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001') + '/login',
    });

    await this.sendEmail(email, 'Welcome to Our Platform!', html);
  }

  async sendInvitationEmail(
    email: string,
    inviterName: string,
    tenantName: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const invitationUrl = `${frontendUrl}/invitations/accept?token=${token}`;

    const template = this.getTemplate('invitation');
    const html = template({
      title: `You're Invited to Join ${tenantName}`,
      inviterName,
      tenantName,
      invitationUrl,
      message: `${inviterName} has invited you to join ${tenantName}.`,
    });

    await this.sendEmail(email, `Invitation to Join ${tenantName}`, html);
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    const template = this.getTemplate('reset-password');
    const html = template({
      title: 'Reset Your Password',
      resetUrl,
      message: 'You requested to reset your password. Click the link below to proceed.',
      expiresIn: '1 hour',
    });

    await this.sendEmail(email, 'Reset Your Password', html);
  }

  async sendInvoiceEmail(
    email: string,
    invoiceNumber: string,
    amount: number,
    dueDate: Date,
  ): Promise<void> {
    const template = this.getTemplate('invoice');
    const html = template({
      title: `Invoice ${invoiceNumber}`,
      invoiceNumber,
      amount: amount.toFixed(2),
      dueDate: dueDate.toLocaleDateString(),
      message: 'Please find your invoice details below.',
    });

    await this.sendEmail(email, `Invoice ${invoiceNumber}`, html);
  }
}
