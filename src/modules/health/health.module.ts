import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaHealthIndicator } from './indicators/prisma.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService, PrismaHealthIndicator],
})
export class HealthModule {}