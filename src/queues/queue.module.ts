import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES, QUEUE_OPTIONS } from './queue.constants';

// Processors
import { EmailProcessor } from './processors/email.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { AuditLogProcessor } from './processors/audit-log.processor';

// Producers
import { EmailProducer } from './producers/email.producer';
import { NotificationProducer } from './producers/notification.producer';
import { AuditLogProducer } from './producers/audit-log.producer';

// Services
import { EmailModule } from '../modules/email/email.module';

const queues = [
  BullModule.registerQueue({
    name: QUEUE_NAMES.EMAIL,
    ...QUEUE_OPTIONS,
  }),
  BullModule.registerQueue({
    name: QUEUE_NAMES.NOTIFICATION,
    ...QUEUE_OPTIONS,
  }),
  BullModule.registerQueue({
    name: QUEUE_NAMES.AUDIT_LOG,
    ...QUEUE_OPTIONS,
  }),
  BullModule.registerQueue({
    name: QUEUE_NAMES.BILLING,
    ...QUEUE_OPTIONS,
  }),
];

const processors = [EmailProcessor, NotificationProcessor, AuditLogProcessor];
const producers = [EmailProducer, NotificationProducer, AuditLogProducer];

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    ...queues,
    EmailModule,
  ],
  providers: [...processors, ...producers],
  exports: [...producers],
})
export class QueueModule {}
