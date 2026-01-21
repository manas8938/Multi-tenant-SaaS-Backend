export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  NOTIFICATION: 'notification-queue',
  AUDIT_LOG: 'audit-log-queue',
  BILLING: 'billing-queue',
} as const;

export const JOB_NAMES = {
  // Email jobs
  SEND_WELCOME_EMAIL: 'send-welcome-email',
  SEND_INVITATION_EMAIL: 'send-invitation-email',
  SEND_PASSWORD_RESET_EMAIL: 'send-password-reset-email',
  SEND_INVOICE_EMAIL: 'send-invoice-email',
  
  // Notification jobs
  CREATE_NOTIFICATION: 'create-notification',
  SEND_PUSH_NOTIFICATION: 'send-push-notification',
  
  // Audit log jobs
  CREATE_AUDIT_LOG: 'create-audit-log',
  
  // Billing jobs
  PROCESS_SUBSCRIPTION: 'process-subscription',
  GENERATE_INVOICE: 'generate-invoice',
} as const;

export const QUEUE_OPTIONS = {
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};
