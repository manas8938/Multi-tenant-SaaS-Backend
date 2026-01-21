import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({ example: 'invitation-token-uuid' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
