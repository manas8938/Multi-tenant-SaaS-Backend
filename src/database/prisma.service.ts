import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      log:
        configService.get('NODE_ENV') === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'info' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : [{ emit: 'stdout', level: 'error' }],
    });
  }

  async onModuleInit() {
    if (this.configService.get('NODE_ENV') === 'development') {
      this.$on('query', (event) => {
        this.logger.debug(`Query: ${event.query}`);
        this.logger.debug(`Duration: ${event.duration}ms`);
      });
    }

    this.$on('error', (event) => {
      this.logger.error(`Prisma Error: ${event.message}`);
    });

    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async cleanDatabase() {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }

    // Delete in order to respect foreign key constraints
    await this.payment.deleteMany();
    await this.invoice.deleteMany();
    await this.subscription.deleteMany();
    await this.notification.deleteMany();
    await this.auditLog.deleteMany();
    await this.apiKey.deleteMany();
    await this.invitation.deleteMany();
    await this.tenantMember.deleteMany();
    await this.tenant.deleteMany();
    await this.user.deleteMany();
  }
}
