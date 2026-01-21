import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionTier } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return { data: subscription };
  }

  getPlans() {
    const plans = [
      {
        tier: SubscriptionTier.FREE,
        name: 'Free',
        price: 0,
        features: {
          maxUsers: 5,
          maxProjects: 3,
          maxStorage: '1 GB',
          support: 'Community',
        },
      },
      {
        tier: SubscriptionTier.PRO,
        name: 'Pro',
        price: 29,
        features: {
          maxUsers: 25,
          maxProjects: 20,
          maxStorage: '10 GB',
          support: 'Email',
        },
      },
      {
        tier: SubscriptionTier.ENTERPRISE,
        name: 'Enterprise',
        price: 99,
        features: {
          maxUsers: 'Unlimited',
          maxProjects: 'Unlimited',
          maxStorage: '100 GB',
          support: 'Priority',
        },
      },
    ];

    return { data: plans };
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: updateSubscriptionDto,
    });

    return {
      message: 'Subscription updated successfully',
      data: updatedSubscription,
    };
  }
}