import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { Role, SubscriptionTier, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto, userId: string) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: createTenantDto.slug },
    });

    if (existingTenant) {
      throw new ConflictException('Slug already exists');
    }

    const tenant = await this.prisma.$transaction(async (prisma) => {
      // Create tenant
      const newTenant = await prisma.tenant.create({
        data: {
          name: createTenantDto.name,
          slug: createTenantDto.slug,
          description: createTenantDto.description,
          ownerId: userId,
        },
      });

      // Create tenant membership for owner
      await prisma.tenantMember.create({
        data: {
          tenantId: newTenant.id,
          userId: userId,
          role: Role.OWNER,
          isDefault: true,
        },
      });

      // Create default subscription (FREE tier with trial)
      await prisma.subscription.create({
        data: {
          tenantId: newTenant.id,
          tier: SubscriptionTier.FREE,
          status: SubscriptionStatus.TRIAL,
          trialStartsAt: new Date(),
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          maxUsers: 5,
          maxProjects: 3,
        },
      });

      return newTenant;
    });

    return { message: 'Tenant created successfully', data: tenant };
  }

  async findAllByUser(userId: string, paginationDto: PaginationDto) {
    const { skip, take, search, sortBy, sortOrder } = paginationDto;

    const where = {
      members: {
        some: { userId },
      },
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          status: true,
          createdAt: true,
          members: {
            where: { userId },
            select: { role: true },
          },
          subscription: {
            select: {
              tier: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    const formattedTenants = tenants.map((tenant) => ({
      ...tenant,
      role: tenant.members[0]?.role,
      members: undefined,
    }));

    return new PaginatedResponseDto(
      formattedTenants,
      total,
      paginationDto.page || 1,
      paginationDto.limit || 10,
    );
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        subscription: true,
        _count: {
          select: { members: true },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return { data: tenant };
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        subscription: {
          select: {
            tier: true,
            status: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return { data: tenant };
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (updateTenantDto.slug && updateTenantDto.slug !== tenant.slug) {
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { slug: updateTenantDto.slug },
      });

      if (existingTenant) {
        throw new ConflictException('Slug already exists');
      }
    }

    const updatedTenant = await this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });

    return { message: 'Tenant updated successfully', data: updatedTenant };
  }

  async remove(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Tenant deleted successfully' };
  }
}