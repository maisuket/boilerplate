import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';

interface AuthenticatedUser {
  id: string;
  role: Role;
}
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ApiPaginatedResponse } from '../../shared/decorators/api-paginated-response.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination (Admin only)' })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async findAll(@Query() query: FindAllUsersDto) {
    return this.usersService.findAll(query);
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  async changePassword(
    @CurrentUser() currentUser: { id: string; role: Role },
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.usersService.changePassword(currentUser.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: { id: string; role: Role },
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id, currentUser.id, currentUser.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: { id: string; role: Role },
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto, currentUser.id, currentUser.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: { id: string; role: Role },
  ): Promise<void> {
    return this.usersService.remove(id, currentUser.id, currentUser.role);
  }

  @Patch(':id/toggle-active')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Toggle user active status (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User status toggled', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async toggleActive(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.toggleActive(id);
  }
}
