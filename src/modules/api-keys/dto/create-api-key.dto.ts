import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Production API Key' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @ApiPropertyOptional({ example: 30, description: 'Expires in days' })
  @IsNumber()
  @IsOptional()
  expiresInDays?: number;

  @ApiPropertyOptional({ example: ['read', 'write'] })
  @IsArray()
  @IsOptional()
  permissions?: string[];
}
