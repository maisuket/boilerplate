import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';

interface RequestWithRefreshUser extends Request {
  user: { id: string; refreshToken: string };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully', type: TokensDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Req() req: RequestWithRefreshUser): Promise<TokensDto> {
    const { id, refreshToken } = req.user;
    return this.authService.refreshTokens(id, refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentUser('id') userId: string): Promise<void> {
    await this.authService.logout(userId);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
