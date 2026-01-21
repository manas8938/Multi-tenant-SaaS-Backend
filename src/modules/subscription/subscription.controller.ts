import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Subscriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get subscription by tenant ID' })
  @ApiResponse({ status: 200, description: 'Subscription found' })
  findByTenant(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.subscriptionService.findByTenant(tenantId);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({ status: 200, description: 'List of plans' })
  getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }
}