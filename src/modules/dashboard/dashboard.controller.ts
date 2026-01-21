import {
  Controller,
  Get,
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
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('user')
  @ApiOperation({ summary: 'Get user dashboard stats' })
  @ApiResponse({ status: 200, description: 'User dashboard data' })
  getUserDashboard(@CurrentUser('id') userId: string) {
    return this.dashboardService.getUserDashboard(userId);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get tenant dashboard stats' })
  @ApiResponse({ status: 200, description: 'Tenant dashboard data' })
  getTenantDashboard(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.dashboardService.getTenantDashboard(tenantId);
  }

  @Get('admin')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  @ApiResponse({ status: 200, description: 'Admin dashboard data' })
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }
}
