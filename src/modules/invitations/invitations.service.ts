import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(createDto: CreateInvitationDto, inviterId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: createDto.tenantId },
      include: { owner: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const inviterMembership = await this.prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId: createDto.tenantId,
          userId: inviterId,
        },
      },
    });

    if (!inviterMembership) {
      throw new ForbiddenException('You are not a member of this tenant');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createDto.email },
    });

    if (existingUser) {
      const existingMembership = await this.prisma.tenantMember.findUnique({
        where: {
          tenantId_userId: {
            tenantId: createDto.tenantId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMembership) {
        throw new ConflictException('User is already a member of this tenant');
      }
    }

    const existingInvitation = await this.prisma.invitation.findUnique({
      where: {
        tenantId_email: {
          tenantId: createDto.tenantId,
          email: createDto.email,
        },
      },
    });

    if (existingInvitation && existingInvitation.status === 'PENDING') {
      throw new ConflictException('Invitation already sent to this email');
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.create({
      data: {
        email: createDto.email,
        role: createDto.role || 'MEMBER',
        token,
        expiresAt,
        tenantId: createDto.tenantId,
        invitedById: inviterId,
      },
      include: {
        tenant: { select: { id: true, name: true, slug: true } },
        invitedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    const inviterName = `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`;
    await this.emailService.sendInvitationEmail(
      createDto.email,
      inviterName,
      tenant.name,
      token,
    );

    return {
      message: 'Invitation sent successfully',
      data: invitation,
    };
  }

  async findByTenant(tenantId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [invitations, total] = await Promise.all([
      this.prisma.invitation.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          invitedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.invitation.count({ where: { tenantId } }),
    ]);

    return {
      data: invitations,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async verifyToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        tenant: { select: { id: true, name: true, slug: true, logo: true } },
        invitedBy: { select: { firstName: true, lastName: true } },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(`Invitation is ${invitation.status.toLowerCase()}`);
    }

    if (new Date() > invitation.expiresAt) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Invitation has expired');
    }

    return {
      data: {
        email: invitation.email,
        role: invitation.role,
        tenant: invitation.tenant,
        invitedBy: invitation.invitedBy,
        expiresAt: invitation.expiresAt,
      },
    };
  }

  async accept(token: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { tenant: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(`Invitation is ${invitation.status.toLowerCase()}`);
    }

    if (new Date() > invitation.expiresAt) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Invitation has expired');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException('This invitation was sent to a different email');
    }

    const existingMembership = await this.prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: { tenantId: invitation.tenantId, userId },
      },
    });

    if (existingMembership) {
      throw new ConflictException('You are already a member of this tenant');
    }

    await this.prisma.$transaction([
      this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      }),
      this.prisma.tenantMember.create({
        data: {
          tenantId: invitation.tenantId,
          userId,
          role: invitation.role,
        },
      }),
    ]);

    return {
      message: 'Invitation accepted successfully',
      data: {
        tenantId: invitation.tenantId,
        tenantName: invitation.tenant.name,
        role: invitation.role,
      },
    };
  }

  async resend(id: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
      include: { tenant: true, invitedBy: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Can only resend pending invitations');
    }

    const newToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const updated = await this.prisma.invitation.update({
      where: { id },
      data: { token: newToken, expiresAt },
    });

    const inviterName = `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`;
    await this.emailService.sendInvitationEmail(
      invitation.email,
      inviterName,
      invitation.tenant.name,
      newToken,
    );

    return { message: 'Invitation resent successfully', data: updated };
  }

  async cancel(id: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id } });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Can only cancel pending invitations');
    }

    await this.prisma.invitation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Invitation cancelled successfully' };
  }
}
