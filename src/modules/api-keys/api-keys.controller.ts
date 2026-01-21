import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('API Keys')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Create API key' })
  @ApiResponse({ status: 201, description: 'API key created' })
  create(@Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeysService.create(createApiKeyDto);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get tenant API keys' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  findByTenant(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.apiKeysService.findByTenant(tenantId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API key by ID' })
  @ApiResponse({ status: 200, description: 'API key details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.apiKeysService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke API key' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  revoke(@Param('id', ParseUUIDPipe) id: string) {
    return this.apiKeysService.revoke(id);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify API key' })
  @ApiResponse({ status: 200, description: 'API key valid' })
  verify(@Body('apiKey') apiKey: string) {
    return this.apiKeysService.verify(apiKey);
  }
}
