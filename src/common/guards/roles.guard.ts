import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user's tenant memberships with roles
    const memberships = await this.prisma.tenantMember.findMany({
      where: { userId: user.id },
      select: { role: true, tenantId: true },
    });

    if (!memberships || memberships.length === 0) {
      throw new ForbiddenException(
        'User is not a member of any tenant. Please create or join a tenant first.',
      );
    }

    // Check if user has any of the required roles in any tenant
    const userRoles = memberships.map((m) => m.role);
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your roles: ${userRoles.join(', ')}`,
      );
    }

    // Attach the user's roles to the request for later use
    request.userRoles = userRoles;
    request.userMemberships = memberships;

    return true;
  }
}
