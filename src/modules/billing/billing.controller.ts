import {
  Controller,
  Get,
  Post,
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
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Role } from '@prisma/client';

@ApiTags('Billing')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices/tenant/:tenantId')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Get tenant invoices' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  getInvoices(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.billingService.getInvoices(tenantId, paginationDto);
  }

  @Get('invoices/:id')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  getInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.getInvoice(id);
  }

  @Post('invoices')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Create invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created' })
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.billingService.createInvoice(createInvoiceDto);
  }

  @Get('payments/tenant/:tenantId')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Get tenant payments' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  getPayments(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.billingService.getPayments(tenantId, paginationDto);
  }

  @Get('summary/tenant/:tenantId')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Get billing summary' })
  @ApiResponse({ status: 200, description: 'Billing summary' })
  getBillingSummary(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.billingService.getBillingSummary(tenantId);
  }
}
