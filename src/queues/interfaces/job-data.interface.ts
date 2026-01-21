export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export interface WelcomeEmailJobData {
  email: string;
  firstName: string;
  lastName?: string;
}

export interface InvitationEmailJobData {
  email: string;
  inviterName: string;
  tenantName: string;
  invitationToken: string;
  expiresAt: Date;
}

export interface NotificationJobData {
  userId: string;
  tenantId?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface AuditLogJobData {
  userId?: string;
  tenantId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface BillingJobData {
  tenantId: string;
  subscriptionId: string;
  action: 'create_invoice' | 'process_payment' | 'subscription_renewal';
  amount?: number;
  metadata?: Record<string, any>;
}
