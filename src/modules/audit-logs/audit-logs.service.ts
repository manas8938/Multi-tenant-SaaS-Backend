import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateAuditLogDto) {
    const auditLog = await this.prisma.auditLog.create({
      data: {
        action: createDto.action,
        entityType: createDto.entityType,
        entityId: createDto.entityId,
        oldValues: createDto.oldValues,
        newValues: createDto.newValues,
        metadata: createDto.metadata,
        ipAddress: createDto.ipAddress,
        userAgent: createDto.userAgent,
        userId: createDto.userId,
        tenantId: createDto.tenantId,
      },
    });

    return auditLog;
  }

  async findAll(queryDto: AuditLogQueryDto) {
    const { page = 1, limit = 10, action, entityType, startDate, endDate } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByTenant(tenantId: string, queryDto: AuditLogQueryDto) {
    const { page = 1, limit = 10, action, entityType } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(userId: string, queryDto: AuditLogQueryDto) {
    const { page = 1, limit = 10, action } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (action) {
      where.action = action;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!auditLog) {
      throw new NotFoundException('Audit log not found');
    }

    return { data: auditLog };
  }

  async log(
    action: AuditAction,
    entityType: string,
    entityId: string | null,
    userId: string | null,
    tenantId: string | null,
    oldValues?: any,
    newValues?: any,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.create({
      action,
      entityType,
      entityId,
      userId,
      tenantId,
      oldValues,
      newValues,
      metadata,
      ipAddress,
      userAgent,
    });
  }
}
