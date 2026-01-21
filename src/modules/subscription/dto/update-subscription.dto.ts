import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ enum: SubscriptionTier })
  @IsEnum(SubscriptionTier)
  @IsOptional()
  tier?: SubscriptionTier;

  @ApiPropertyOptional({ enum: SubscriptionStatus })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;
}