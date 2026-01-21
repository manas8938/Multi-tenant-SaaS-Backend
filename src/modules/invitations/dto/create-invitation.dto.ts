import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateInvitationDto {
  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @ApiPropertyOptional({ enum: Role, default: Role.MEMBER })
  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.MEMBER;
}
