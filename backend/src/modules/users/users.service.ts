import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PaginatedResult } from '../../shared/interfaces/pagination.interface';
import { buildPaginatedResult, buildPaginationParams } from '../../shared/utils/pagination.util';
import { hashPassword, comparePasswords } from '../../shared/utils/hash.util';
import { Role, Prisma } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findFirst(
      { email: createUserDto.email.toLowerCase(), deletedAt: null },
      { id: true }, // Optimization: Only need ID for existence check
    );

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await hashPassword(createUserDto.password);
    const user = await this.usersRepository.create(createUserDto, hashedPassword);

    return new UserResponseDto(user);
  }

  async findAll(query: FindAllUsersDto): Promise<PaginatedResult<UserResponseDto>> {
    const [users, total] = await this.usersRepository.findManyAndCount(query);
    const params = buildPaginationParams(query);

    const userDtos = users.map(u => new UserResponseDto(u));

    return buildPaginatedResult(userDtos, total, params);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findUnique({
      id,
      deletedAt: null,
    } as Prisma.UserWhereUniqueInput);

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findUnique({
      email: email.toLowerCase(),
      deletedAt: null,
    } as Prisma.UserWhereUniqueInput);

    if (!user) return null;

    return new UserResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requestingUserId: string,
    requestingUserRole: Role,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findUnique(
      { id, deletedAt: null } as Prisma.UserWhereUniqueInput,
      { id: true },
    );

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

    const updateData: Prisma.UserUpdateInput = { ...updateUserDto };

    if (updateUserDto.email) {
      const existingEmail = await this.usersRepository.findFirst(
        {
          email: updateUserDto.email.toLowerCase(),
          NOT: { id },
          deletedAt: null,
        },
        { id: true },
      );

      if (existingEmail) {
        throw new ConflictException('Email is already in use');
      }
      updateData.email = updateUserDto.email.toLowerCase();
    }

    if (updateUserDto.password) {
      updateData.password = await hashPassword(updateUserDto.password);
    }

    const updated = await this.usersRepository.update(id, updateData);

    return new UserResponseDto(updated);
  }

  async remove(id: string, requestingUserId: string, requestingUserRole: Role): Promise<void> {
    const user = await this.usersRepository.findUnique(
      { id, deletedAt: null } as Prisma.UserWhereUniqueInput,
      { id: true },
    );

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    if (requestingUserId !== id && requestingUserRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own account');
    }

    if (requestingUserId === id && requestingUserRole === Role.ADMIN) {
      throw new ForbiddenException('Admins cannot delete their own account');
    }

    await this.usersRepository.softDelete(id);
  }

  async toggleActive(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findUnique(
      { id, deletedAt: null } as Prisma.UserWhereUniqueInput,
      { id: true, isActive: true },
    );

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    const updated = await this.usersRepository.update(id, { isActive: !user.isActive });

    return new UserResponseDto(updated);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findUnique(
      { id, deletedAt: null } as Prisma.UserWhereUniqueInput,
      { id: true, password: true }, // Precisamos da senha aqui para validar
    );

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    if (!user.password) {
      throw new BadRequestException('User does not have a password set');
    }

    const isPasswordValid = await comparePasswords(dto.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(dto.newPassword);

    await this.usersRepository.update(id, { password: hashedPassword });
  }
}
