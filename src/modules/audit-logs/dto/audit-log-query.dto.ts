import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditAction } from '@prisma/client';

export class AuditLogQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ enum: AuditAction })
  @IsEnum(AuditAction)
  @IsOptional()
  action?: AuditAction;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
