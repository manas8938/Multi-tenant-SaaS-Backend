import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Tenants')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  create(
    @Body() createTenantDto: CreateTenantDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.tenantsService.create(createTenantDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants for current user' })
  @ApiResponse({ status: 200, description: 'List of tenants' })
  findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.tenantsService.findAllByUser(userId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant found' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get tenant by slug' })
  @ApiResponse({ status: 200, description: 'Tenant found' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.remove(id);
  }
}