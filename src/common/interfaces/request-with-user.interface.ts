import { Request } from 'express';
import { User, Tenant, TenantMember } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface RequestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  tenantId?: string;
  tenantRole?: string;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
  tenant?: Tenant;
  tenantMember?: TenantMember;
}