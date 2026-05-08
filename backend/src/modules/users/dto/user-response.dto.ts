import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Jane Smith' })
  name: string;

  @Expose()
  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @Expose()
  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @Expose()
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
