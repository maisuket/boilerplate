import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import * as hashUtil from '../../shared/utils/hash.util';

jest.mock('../../shared/utils/hash.util', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-new-password'),
  comparePasswords: jest.fn().mockResolvedValue(true),
}));

const makeUser = (overrides: Partial<Record<string, any>> = {}) => ({
  id: 'user-uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  role: Role.USER,
  isActive: true,
  emailVerified: false,
  lastLoginAt: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockRepo = {
  create: jest.fn(),
  findManyAndCount: jest.fn(),
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = { name: 'New User', email: 'new@example.com', password: 'Pass@123' };

    it('creates user and returns DTO without sensitive fields', async () => {
      mockRepo.findFirst.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(makeUser({ email: dto.email, name: dto.name }));

      const result = await service.create(dto as any);

      expect(result.email).toBe(dto.email);
      expect(result).not.toHaveProperty('password');
      expect(hashUtil.hashPassword).toHaveBeenCalledWith(dto.password);
    });

    it('throws ConflictException for duplicate email', async () => {
      mockRepo.findFirst.mockResolvedValue({ id: 'existing-id' });

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    });
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated result', async () => {
      const users = [makeUser(), makeUser({ id: 'user-uuid-2', email: 'b@example.com' })];
      mockRepo.findManyAndCount.mockResolvedValue([users, 2]);

      const result = await service.findAll({ page: 1, limit: 10 } as any);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('returns empty paginated result when no users', async () => {
      mockRepo.findManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10 } as any);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('admin can view any user', async () => {
      mockRepo.findUnique.mockResolvedValue(makeUser());

      const result = await service.findOne('user-uuid-1', 'admin-uuid', Role.ADMIN);

      expect(result.id).toBe('user-uuid-1');
    });

    it('user can view own profile', async () => {
      mockRepo.findUnique.mockResolvedValue(makeUser());

      const result = await service.findOne('user-uuid-1', 'user-uuid-1', Role.USER);

      expect(result.id).toBe('user-uuid-1');
    });

    it('throws ForbiddenException when user tries to view another user profile', async () => {
      await expect(
        service.findOne('user-uuid-1', 'other-user-uuid', Role.USER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockRepo.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent-id', 'nonexistent-id', Role.USER),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates user name', async () => {
      const updated = makeUser({ name: 'Updated Name' });
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1' });
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.update(
        'user-uuid-1',
        { name: 'Updated Name' },
        'user-uuid-1',
        Role.USER,
      );

      expect(result.name).toBe('Updated Name');
    });

    it('throws ForbiddenException when user tries to update another user', async () => {
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1' });

      await expect(
        service.update('user-uuid-1', { name: 'x' }, 'other-uuid', Role.USER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when non-admin tries to change role', async () => {
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1' });

      await expect(
        service.update('user-uuid-1', { role: Role.ADMIN } as any, 'user-uuid-1', Role.USER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows admin to change another user role', async () => {
      const updated = makeUser({ role: Role.ADMIN });
      mockRepo.findUnique.mockResolvedValueOnce({ id: 'user-uuid-1' });
      mockRepo.findFirst.mockResolvedValue(null);
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.update(
        'user-uuid-1',
        { role: Role.ADMIN } as any,
        'admin-uuid',
        Role.ADMIN,
      );

      expect(result.role).toBe(Role.ADMIN);
    });

    it('throws ConflictException on duplicate email update', async () => {
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1' });
      mockRepo.findFirst.mockResolvedValue({ id: 'other-uuid' }); // email in use

      await expect(
        service.update('user-uuid-1', { email: 'taken@example.com' }, 'user-uuid-1', Role.USER),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes password and sets passwordChangedAt when password is updated', async () => {
      const updated = makeUser();
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1' });
      mockRepo.update.mockResolvedValue(updated);

      await service.update(
        'user-uuid-1',
        { password: 'NewPass@123' },
        'user-uuid-1',
        Role.USER,
      );

      expect(hashUtil.hashPassword).toHaveBeenCalledWith('NewPass@123');
      expect(mockRepo.update).toHaveBeenCalledWith(
        'user-uuid-1',
        expect.objectContaining({ passwordChangedAt: expect.any(Date) }),
      );
    });

    it('throws NotFoundException when target user does not exist', async () => {
      mockRepo.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'x' }, 'admin-uuid', Role.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('user can delete own account', async () => {
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1' });
      mockRepo.softDelete.mockResolvedValue(undefined);

      await expect(
        service.remove('user-uuid-1', 'user-uuid-1', Role.USER),
      ).resolves.toBeUndefined();
    });

    it('admin can delete another user', async () => {
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1' });
      mockRepo.softDelete.mockResolvedValue(undefined);

      await expect(
        service.remove('user-uuid-1', 'admin-uuid', Role.ADMIN),
      ).resolves.toBeUndefined();
    });

    it('throws ForbiddenException when user tries to delete another user', async () => {
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1' });

      await expect(
        service.remove('user-uuid-1', 'other-uuid', Role.USER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when admin tries to delete own account', async () => {
      mockRepo.findUnique.mockResolvedValue({ id: 'admin-uuid' });

      await expect(
        service.remove('admin-uuid', 'admin-uuid', Role.ADMIN),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockRepo.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('nonexistent', 'admin-uuid', Role.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── toggleActive ──────────────────────────────────────────────────────────

  describe('toggleActive', () => {
    it('sets isActive to false when user is currently active', async () => {
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1', isActive: true });
      mockRepo.update.mockResolvedValue(makeUser({ isActive: false }));

      const result = await service.toggleActive('user-uuid-1');

      expect(mockRepo.update).toHaveBeenCalledWith('user-uuid-1', { isActive: false });
      expect(result.isActive).toBe(false);
    });

    it('sets isActive to true when user is currently inactive', async () => {
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1', isActive: false });
      mockRepo.update.mockResolvedValue(makeUser({ isActive: true }));

      const result = await service.toggleActive('user-uuid-1');

      expect(mockRepo.update).toHaveBeenCalledWith('user-uuid-1', { isActive: true });
      expect(result.isActive).toBe(true);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockRepo.findUnique.mockResolvedValue(null);

      await expect(service.toggleActive('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── changePassword ────────────────────────────────────────────────────────

  describe('changePassword', () => {
    it('changes password when current password is correct', async () => {
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1', password: 'hashed-old' });
      (hashUtil.comparePasswords as jest.Mock).mockResolvedValue(true);
      mockRepo.update.mockResolvedValue(makeUser());

      await service.changePassword('user-uuid-1', {
        currentPassword: 'OldPass@123',
        newPassword: 'NewPass@456',
      } as any);

      expect(mockRepo.update).toHaveBeenCalledWith(
        'user-uuid-1',
        expect.objectContaining({
          password: 'hashed-new-password',
          passwordChangedAt: expect.any(Date),
        }),
      );
    });

    it('throws BadRequestException when current password is wrong', async () => {
      mockRepo.findUnique.mockResolvedValue({ id: 'user-uuid-1', password: 'hashed-old' });
      (hashUtil.comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-uuid-1', {
          currentPassword: 'WrongPass@123',
          newPassword: 'NewPass@456',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockRepo.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('nonexistent', {
          currentPassword: 'x',
          newPassword: 'y',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
