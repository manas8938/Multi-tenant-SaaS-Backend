import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvoice(createDto: CreateInvoiceDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId: createDto.tenantId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const invoiceNumber = `INV-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: createDto.amount,
        currency: createDto.currency || 'USD',
        dueDate: new Date(createDto.dueDate),
        subscriptionId: subscription.id,
      },
    });

    return { message: 'Invoice created successfully', data: invoice };
  }

  async getInvoices(tenantId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { subscriptionId: subscription.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where: { subscriptionId: subscription.id } }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return { data: invoice };
  }

  async getPayments(tenantId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { subscriptionId: subscription.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where: { subscriptionId: subscription.id } }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBillingSummary(tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        tenant: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const [totalInvoices, paidInvoices, pendingInvoices, totalPayments] =
      await Promise.all([
        this.prisma.invoice.count({
          where: { subscriptionId: subscription.id },
        }),
        this.prisma.invoice.count({
          where: { subscriptionId: subscription.id, status: 'paid' },
        }),
        this.prisma.invoice.count({
          where: { subscriptionId: subscription.id, status: 'pending' },
        }),
        this.prisma.payment.aggregate({
          where: { subscriptionId: subscription.id, status: 'COMPLETED' },
          _sum: { amount: true },
        }),
      ]);

    return {
      data: {
        subscription: {
          tier: subscription.tier,
          status: subscription.status,
        },
        invoices: {
          total: totalInvoices,
          paid: paidInvoices,
          pending: pendingInvoices,
        },
        totalPaid: totalPayments._sum.amount || 0,
      },
    };
  }
}
