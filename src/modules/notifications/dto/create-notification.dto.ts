import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({ example: 'New message' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'You have a new message from John' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  data?: any;

  @ApiProperty()
  @IsUUID()
  userId!: string;
}
