import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { HashUtil } from '../../common/utils/hash.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await HashUtil.hash(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
      },
    });

    return { message: 'User created successfully', data: user };
  }

  async findAll(paginationDto: PaginationDto) {
    const { skip, take, search, sortBy, sortOrder } = paginationDto;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
          deletedAt: null,
        }
      : { deletedAt: null };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return new PaginatedResponseDto(
      users,
      total,
      paginationDto.page || 1,
      paginationDto.limit || 10,
    );
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        tenantMemberships: {
          select: {
            id: true,
            role: true,
            isDefault: true,
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { data: user };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        updatedAt: true,
      },
    });

    return { message: 'User updated successfully', data: updatedUser };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'User deleted successfully' };
  }
}