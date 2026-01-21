import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  private generateApiKey(): string {
    const prefix = 'sk_live_';
    const randomPart = crypto.randomBytes(24).toString('hex');
    return `${prefix}${randomPart}`;
  }

  private hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  async create(createDto: CreateApiKeyDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: createDto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const apiKey = this.generateApiKey();
    const hashedKey = this.hashApiKey(apiKey);

    let expiresAt: Date | null = null;
    if (createDto.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + createDto.expiresInDays);
    }

    const created = await this.prisma.apiKey.create({
      data: {
        name: createDto.name,
        key: apiKey.substring(0, 12) + '...',
        hashedKey,
        expiresAt,
        permissions: createDto.permissions || [],
        tenantId: createDto.tenantId,
      },
    });

    return {
      message: 'API key created successfully',
      data: {
        id: created.id,
        name: created.name,
        key: apiKey,
        expiresAt: created.expiresAt,
        permissions: created.permissions,
        createdAt: created.createdAt,
      },
      warning: 'Save this API key now. You will not be able to see it again!',
    };
  }

  async findByTenant(tenantId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [apiKeys, total] = await Promise.all([
      this.prisma.apiKey.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          key: true,
          isActive: true,
          lastUsedAt: true,
          expiresAt: true,
          permissions: true,
          createdAt: true,
        },
      }),
      this.prisma.apiKey.count({ where: { tenantId } }),
    ]);

    return {
      data: apiKeys,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        permissions: true,
        createdAt: true,
        tenant: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return { data: apiKey };
  }

  async revoke(id: string) {
    const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'API key revoked successfully' };
  }

  async verify(apiKey: string) {
    const hashedKey = this.hashApiKey(apiKey);

    const key = await this.prisma.apiKey.findFirst({
      where: { hashedKey },
      include: {
        tenant: { select: { id: true, name: true, slug: true, status: true } },
      },
    });

    if (!key) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (!key.isActive) {
      throw new UnauthorizedException('API key has been revoked');
    }

    if (key.expiresAt && new Date() > key.expiresAt) {
      throw new UnauthorizedException('API key has expired');
    }

    await this.prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      valid: true,
      data: {
        tenantId: key.tenant.id,
        tenantName: key.tenant.name,
        permissions: key.permissions,
      },
    };
  }
}
