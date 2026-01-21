import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

// Config
import { configuration, validationSchema } from './config';

// Database
import { PrismaModule } from './database/prisma.module';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { HealthModule } from './modules/health/health.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BillingModule } from './modules/billing/billing.module';
import { EmailModule } from './modules/email/email.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CacheModule } from './modules/cache/cache.module';
import { QueueModule } from './queues/queue.module';

// Common
import { AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor, TransformInterceptor } from './common/interceptors';
import { CorrelationIdMiddleware, LoggerMiddleware } from './common/middleware';

// App
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: ['.env', '.env.local'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Event emitter for internal events
    EventEmitterModule.forRoot(),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Database
    PrismaModule,

    // Cache
    CacheModule,

    // Queue (BullMQ)
    QueueModule,

    // Feature modules
    AuthModule,
    UsersModule,
    TenantsModule,
    SubscriptionModule,
    HealthModule,
    AuditLogsModule,
    NotificationsModule,
    BillingModule,
    EmailModule,
    InvitationsModule,
    ApiKeysModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, LoggerMiddleware).forRoutes('*path');
  }
}
