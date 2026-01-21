import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'My Company Updated' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'my-company-updated' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase and can only contain letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'An updated description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
