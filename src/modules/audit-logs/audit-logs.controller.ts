import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { Role } from '@prisma/client';

@ApiTags('Audit Logs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all audit logs' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  findAll(@Query() queryDto: AuditLogQueryDto) {
    return this.auditLogsService.findAll(queryDto);
  }

  @Get('tenant/:tenantId')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Get audit logs by tenant' })
  @ApiResponse({ status: 200, description: 'Tenant audit logs' })
  findByTenant(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query() queryDto: AuditLogQueryDto,
  ) {
    return this.auditLogsService.findByTenant(tenantId, queryDto);
  }

  @Get('user/:userId')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Get audit logs by user' })
  @ApiResponse({ status: 200, description: 'User audit logs' })
  findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() queryDto: AuditLogQueryDto,
  ) {
    return this.auditLogsService.findByUser(userId, queryDto);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({ status: 200, description: 'Audit log details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditLogsService.findOne(id);
  }
}
