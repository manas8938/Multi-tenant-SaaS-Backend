import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        type: createDto.type,
        title: createDto.title,
        content: createDto.content,
        data: createDto.data,
        userId: createDto.userId,
      },
    });

    return notification;
  }

  async findByUser(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return { data: { unreadCount: count } };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });

    return { message: 'Notification marked as read', data: updated };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });

    return { message: 'All notifications marked as read' };
  }

  async remove(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.notification.delete({ where: { id } });

    return { message: 'Notification deleted' };
  }

  async notify(
    userId: string,
    type: NotificationType,
    title: string,
    content: string,
    data?: any,
  ) {
    return this.create({
      userId,
      type,
      title,
      content,
      data,
    });
  }
}
