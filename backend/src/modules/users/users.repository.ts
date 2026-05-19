import { Injectable } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { buildPaginationParams, buildSearchQuery } from '../../shared/utils/pagination.util';

export const safeUserSelect: Prisma.UserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  emailVerified: true,
  lastLoginAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, hashedPassword: string): Promise<User> {
    return this.prisma.extended.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email.toLowerCase(),
        password: hashedPassword,
        role: createUserDto.role,
        isActive: createUserDto.isActive ?? true,
      },
      select: safeUserSelect,
    });
  }

  async findManyAndCount(query: FindAllUsersDto): Promise<[User[], number]> {
    const params = buildPaginationParams(query);
    const searchQuery = buildSearchQuery(query.search, ['name', 'email']);

    // Mantido aqui pois o método .count() não foi interceptado na extensão do Prisma
    const where: Prisma.UserWhereInput = { ...searchQuery, deletedAt: null };

    if (query.status) {
      where.isActive = query.status === 'active';
    }

    if (query.role) {
      where.role = query.role;
    }

    return this.prisma.$transaction([
      this.prisma.extended.user.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: params.orderBy,
        select: safeUserSelect,
      }),
      this.prisma.extended.user.count({ where }),
    ]);
  }

  async findUnique(
    where: Prisma.UserWhereUniqueInput,
    select?: Prisma.UserSelect,
  ): Promise<Partial<User> | null> {
    return this.prisma.extended.user.findUnique({
      where,
      select: select || safeUserSelect,
    });
  }

  async findFirst(
    where: Prisma.UserWhereInput,
    select?: Prisma.UserSelect,
  ): Promise<Partial<User> | null> {
    return this.prisma.extended.user.findFirst({
      where,
      select: select || safeUserSelect,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.extended.user.update({
      where: { id },
      data,
      select: safeUserSelect,
    });
  }

  async softDelete(id: string): Promise<User> {
    // A extensão converte este .delete() em um .update({ data: { deletedAt: new Date() } }) automaticamente
    return this.prisma.extended.user.delete({
      where: { id },
    }) as unknown as Promise<User>;
  }
}
