import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Matches, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'My Company' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'my-company' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase and can only contain letters, numbers, and hyphens',
  })
  slug!: string;

  @ApiPropertyOptional({ example: 'A great company' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
