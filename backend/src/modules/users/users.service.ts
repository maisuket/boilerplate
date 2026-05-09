import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { PaginatedResult } from '../../shared/interfaces/pagination.interface';
import {
  buildPaginationParams,
  buildPaginatedResult,
  buildSearchQuery,
} from '../../shared/utils/pagination.util';
import { hashPassword } from '../../shared/utils/hash.util';
import { Role, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await hashPassword(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email.toLowerCase(),
        password: hashedPassword,
        role: createUserDto.role,
        isActive: createUserDto.isActive ?? true,
      },
    });

    return new UserResponseDto(user);
  }

  async findAll(query: FindAllUsersDto): Promise<PaginatedResult<UserResponseDto>> {
    const params = buildPaginationParams(query);

    const searchQuery = buildSearchQuery(query.search, ['name', 'email']);

    const where: Prisma.UserWhereInput = searchQuery || {};

    if (query.status) {
      where.isActive = query.status === 'active';
    }

    if (query.role) {
      where.role = query.role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: params.orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          password: false,
          refreshToken: false,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const userDtos = users.map(u => new UserResponseDto(u as any));

    return buildPaginatedResult(userDtos, total, params);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return null;

    return new UserResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requestingUserId: string,
    requestingUserRole: Role,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    // Only admins can update other users or change roles
    if (requestingUserId !== id && requestingUserRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Only admins can change roles
    if (updateUserDto.role && requestingUserRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can change user roles');
    }

    const updateData: any = { ...updateUserDto };

    if (updateUserDto.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email.toLowerCase(),
          NOT: { id },
        },
      });

      if (existingEmail) {
        throw new ConflictException('Email is already in use');
      }
      updateData.email = updateUserDto.email.toLowerCase();
    }

    if (updateUserDto.password) {
      updateData.password = await hashPassword(updateUserDto.password);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return new UserResponseDto(updated);
  }

  async remove(id: string, requestingUserId: string, requestingUserRole: Role): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    if (requestingUserId !== id && requestingUserRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own account');
    }

    if (requestingUserId === id && requestingUserRole === Role.ADMIN) {
      throw new ForbiddenException('Admins cannot delete their own account');
    }

    await this.prisma.user.delete({ where: { id } });
  }

  async toggleActive(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return new UserResponseDto(updated);
  }
}
