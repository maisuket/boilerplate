import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token received via email' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewPassword@123', description: 'New password (min 8 chars, uppercase, lowercase, number, special char)' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-_=+])[A-Za-z\d@$!%*?&^#\-_=+]{8,}$/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;
}
