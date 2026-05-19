import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';
import { hashPassword, comparePasswords, hashToken, compareTokens } from '../../shared/utils/hash.util';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { User } from '@prisma/client';
import { MailService } from '../../mail/mail.service';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email.toLowerCase(), deletedAt: null },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await hashPassword(registerDto.password);

    return this.prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          name: registerDto.name,
          email: registerDto.email.toLowerCase(),
          password: hashedPassword,
          // role intentionally omitted — new accounts are always Role.USER
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.mailService
        .sendWelcomeEmail(user.email, user.name)
        .catch(err => this.logger.error('Failed to send welcome email', err));

      const tokens = await this.generateTokens(user);
      const refreshSecret = this.configService.get<string>('jwt.refreshSecret')!;
      const hashedRefreshToken = hashToken(tokens.refreshToken, refreshSecret);

      await tx.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
      });

      return { ...tokens, user };
    });
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase(), deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generic message for both "user not found" and "wrong password" — prevents email enumeration
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check lockout before password comparison to avoid timing side-channel
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        'Account temporarily locked due to too many failed attempts. Try again later.',
      );
    }

    const passwordValid = await comparePasswords(loginDto.password, user.password);

    if (!passwordValid) {
      await this.handleFailedLogin(user.id, user.loginAttempts);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Do NOT reveal account deactivation status with a different message
    if (!user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret')!;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hashToken(tokens.refreshToken, refreshSecret),
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const { password, ...userProfile } = user;
    return { ...tokens, user: userProfile };
  }

  async refreshTokens(userId: string, rawRefreshToken: string): Promise<TokensDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Access denied');
    }

    // Service is self-contained — validates token independently of the Passport strategy
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret')!;
    const tokenMatches = compareTokens(rawRefreshToken, user.refreshToken, refreshSecret);

    if (!tokenMatches) {
      // Potential token theft — invalidate stored token to force full re-auth
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async generateTokens(user: Pick<User, 'id' | 'email' | 'role'>): Promise<TokensDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.getOrThrow<string>('jwt.expiresIn') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.getOrThrow<string>('jwt.refreshExpiresIn') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret')!;
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashToken(refreshToken, refreshSecret) },
    });
  }

  private async handleFailedLogin(userId: string, currentAttempts: number): Promise<void> {
    const attempts = currentAttempts + 1;
    const shouldLock = attempts >= MAX_LOGIN_ATTEMPTS;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: attempts,
        ...(shouldLock && { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) }),
      },
    });
  }
}
