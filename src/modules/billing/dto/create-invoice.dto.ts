import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: '2026-02-21' })
  @IsDateString()
  dueDate!: string;
}
