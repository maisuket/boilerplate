import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { PaginationDto } from '@shared/dto/pagination.dto';

export class FindAllUsersDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['active', 'inactive'], description: 'Filter by user status' })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Filter by user role' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
