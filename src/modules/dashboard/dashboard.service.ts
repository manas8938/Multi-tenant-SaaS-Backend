import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserDashboard(userId: string) {
    const [user, memberships, notifications] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.tenantMember.findMany({
        where: { userId },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              subscription: { select: { tier: true, status: true } },
            },
          },
        },
      }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      data: {
        user,
        stats: {
          tenantsCount: memberships.length,
          unreadNotifications: notifications,
        },
        tenants: memberships.map((m) => ({
          ...m.tenant,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
      },
    };
  }

  async getTenantDashboard(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscription: true,
        _count: { select: { members: true, invitations: true, apiKeys: true } },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const [recentActivity, pendingInvitations] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.invitation.count({ where: { tenantId, status: 'PENDING' } }),
    ]);

    return {
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          createdAt: tenant.createdAt,
        },
        subscription: tenant.subscription,
        stats: {
          membersCount: tenant._count.members,
          invitationsCount: tenant._count.invitations,
          pendingInvitations,
          apiKeysCount: tenant._count.apiKeys,
        },
        recentActivity,
      },
    };
  }

  async getAdminDashboard() {
    const [totalUsers, totalTenants, subscriptionsByTier, recentUsers, recentTenants] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.tenant.count({ where: { deletedAt: null } }),
        this.prisma.subscription.groupBy({
          by: ['tier'],
          _count: { tier: true },
        }),
        this.prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
        }),
        this.prisma.tenant.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, slug: true, status: true, createdAt: true },
        }),
      ]);

    const tierStats = subscriptionsByTier.reduce(
      (acc, item) => {
        acc[item.tier] = item._count.tier;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      data: {
        stats: { totalUsers, totalTenants, subscriptionsByTier: tierStats },
        recentUsers,
        recentTenants,
      },
    };
  }
}
