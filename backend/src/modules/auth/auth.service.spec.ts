import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { Role } from '@prisma/client';
import * as hashUtil from '../../shared/utils/hash.util';

jest.mock('../../shared/utils/hash.util', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  comparePasswords: jest.fn().mockResolvedValue(true),
  hashToken: jest.fn().mockReturnValue('hashed-token'),
  compareTokens: jest.fn().mockReturnValue(true),
}));

const mockUser = {
  id: 'user-uuid-123',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed-password',
  role: Role.USER,
  refreshToken: 'hashed-refresh-token',
  isActive: true,
  emailVerified: false,
  lastLoginAt: null,
  loginAttempts: 0,
  lockedUntil: null,
  passwordChangedAt: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation(async (callback) => callback(mockPrismaService)),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, any> = {
      'jwt.secret': 'test-secret-at-least-32-chars-long!!',
      'jwt.expiresIn': '15m',
      'jwt.refreshSecret': 'test-refresh-secret-at-least-32chars!',
      'jwt.refreshExpiresIn': '7d',
    };
    return config[key];
  }),
  getOrThrow: jest.fn((key: string) => {
    const config: Record<string, any> = {
      'jwt.secret': 'test-secret-at-least-32-chars-long!!',
      'jwt.refreshSecret': 'test-refresh-secret-at-least-32chars!',
    };
    if (!(key in config)) throw new Error(`Config key not found: ${key}`);
    return config[key];
  }),
};

const mockMailService = {
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrismaService;
  let jwtService: typeof mockJwtService;
  let mailService: typeof mockMailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password@123',
    };

    it('should successfully register a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshToken');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email.toLowerCase() },
      });
      expect(hashUtil.hashPassword).toHaveBeenCalledWith(registerDto.password);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow(
        'A user with this email already exists',
      );
    });

    it('should send welcome email after registration', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.register(registerDto);

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith(mockUser.email, mockUser.name);
    });

    it('should normalize email to lowercase', async () => {
      const upperCaseEmailDto = { ...registerDto, email: 'Test@Example.COM' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.register(upperCaseEmailDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'test@example.com' }),
        }),
      );
    });

    it('should not allow setting role via register (always USER)', async () => {
      const dtoWithRole = { ...registerDto } as any;
      dtoWithRole.role = Role.ADMIN;
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.register(dtoWithRole);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ role: Role.ADMIN }),
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password@123',
    };

    it('should successfully login with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (hashUtil.comparePasswords as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (hashUtil.comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with generic message when password is wrong (enumeration prevention)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (hashUtil.comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Your account has been deactivated');
    });

    it('should throw UnauthorizedException if account is locked', async () => {
      const lockedUser = { ...mockUser, lockedUntil: new Date(Date.now() + 10 * 60 * 1000) };
      mockPrismaService.user.findUnique.mockResolvedValue(lockedUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should update lastLoginAt on successful login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (hashUtil.comparePasswords as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.login(loginDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ lastLoginAt: expect.any(Date) }),
        }),
      );
    });
  });

  describe('logout', () => {
    it('should clear refresh token on logout', async () => {
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.logout('user-uuid-123');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-123' },
        data: { refreshToken: null },
      });
    });
  });

  describe('getMe', () => {
    it('should return user profile without sensitive fields', async () => {
      const userProfile = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        isActive: mockUser.isActive,
        emailVerified: mockUser.emailVerified,
        lastLoginAt: mockUser.lastLoginAt,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userProfile);

      const result = await service.getMe('user-uuid-123');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('refreshTokens', () => {
    const rawRefreshToken = 'raw-refresh-token-value';

    it('should return new token pair on valid refresh', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('new-access-token');
      (hashUtil.compareTokens as jest.Mock).mockReturnValue(true);

      const result = await service.refreshTokens(mockUser.id, rawRefreshToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException if user not found during refresh', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('non-existent-id', rawRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if stored refresh token is null', async () => {
      const userWithNoToken = { ...mockUser, refreshToken: null };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithNoToken);

      await expect(service.refreshTokens(mockUser.id, rawRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should invalidate refresh token and throw if token does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      (hashUtil.compareTokens as jest.Mock).mockReturnValue(false);

      await expect(service.refreshTokens(mockUser.id, 'wrong-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { refreshToken: null } }),
      );
    });

    it('should throw UnauthorizedException if user is inactive on refresh', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(service.refreshTokens(mockUser.id, rawRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
