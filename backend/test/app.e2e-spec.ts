import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { createHash } from 'crypto';
import { TokenType } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransformInterceptor } from '../src/shared/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/shared/filters/http-exception.filter';
import { Reflector } from '@nestjs/core';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let createdUserId: string;

  const adminCredentials = {
    email: 'admin@example.com',
    password: 'Admin@123456',
  };

  const testUser = {
    name: 'E2E Test User',
    email: `e2e-${Date.now()}@example.com`,
    password: 'Test@123456',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    // Clean up test data
    if (createdUserId) {
      await prisma.token.deleteMany({ where: { userId: createdUserId } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: createdUserId } }).catch(() => {});
    }
    await prisma.token.deleteMany({ where: { user: { email: testUser.email } } }).catch(() => {});
    await prisma.user.deleteMany({ where: { email: testUser.email } }).catch(() => {});
    await app.close();
  });

  // ============================================================
  // Health Check
  // ============================================================
  describe('Health Checks', () => {
    it('GET /api/health - should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(res => {
          expect(res.status).toBeLessThan(600);
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('GET /api/health/ping - should return pong', () => {
      return request(app.getHttpServer())
        .get('/api/health/ping')
        .expect(200)
        .expect(res => {
          expect(res.body.data?.message || res.body.message).toBe('pong');
        });
    });
  });

  // ============================================================
  // Authentication
  // ============================================================
  describe('Authentication', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', () => {
        return request(app.getHttpServer())
          .post('/api/auth/register')
          .send(testUser)
          .expect(201)
          .expect(res => {
            expect(res.body.data || res.body).toMatchObject(
              expect.objectContaining({
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
              }),
            );
            const data = res.body.data || res.body;
            expect(data.user).not.toHaveProperty('password');
            expect(data.user.email).toBe(testUser.email);
          });
      });

      it('should fail to register with duplicate email', () => {
        return request(app.getHttpServer())
          .post('/api/auth/register')
          .send(testUser)
          .expect(409);
      });

      it('should fail with invalid email format', () => {
        return request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ ...testUser, email: 'not-an-email' })
          .expect(400);
      });

      it('should fail with weak password', () => {
        return request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ ...testUser, email: 'new@example.com', password: '123' })
          .expect(400);
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials and return tokens', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(adminCredentials)
          .expect(200);

        const data = res.body.data || res.body;
        expect(data.accessToken).toBeDefined();
        expect(data.refreshToken).toBeDefined();
        expect(data.user).toBeDefined();
        adminToken = data.accessToken;
      });

      it('should obtain user token', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: testUser.email, password: testUser.password })
          .expect(200);

        const data = res.body.data || res.body;
        userToken = data.accessToken;
        createdUserId = data.user.id;
      });

      it('should fail with invalid password', () => {
        return request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: adminCredentials.email, password: 'WrongPassword@1' })
          .expect(401);
      });

      it('should fail with non-existent email', () => {
        return request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'nobody@nowhere.com', password: 'Password@123' })
          .expect(401);
      });
    });

    describe('GET /api/auth/me', () => {
      it('should return current user profile with valid token', () => {
        return request(app.getHttpServer())
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect(res => {
            const data = res.body.data || res.body;
            expect(data.email).toBe(adminCredentials.email);
            expect(data).not.toHaveProperty('password');
          });
      });

      it('should return 401 without token', () => {
        return request(app.getHttpServer()).get('/api/auth/me').expect(401);
      });

      it('should return 401 with invalid token', () => {
        return request(app.getHttpServer())
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalid.token.here')
          .expect(401);
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout successfully with valid token', () => {
        return request(app.getHttpServer())
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);
      });
    });

    describe('POST /api/auth/forgot-password', () => {
      it('should return 200 even for non-existent email (no enumeration)', () => {
        return request(app.getHttpServer())
          .post('/api/auth/forgot-password')
          .send({ email: 'nobody@nowhere.com' })
          .expect(200);
      });

      it('should return 200 and create a reset token for existing user', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/forgot-password')
          .send({ email: adminCredentials.email })
          .expect(200);

        const adminUser = await prisma.user.findUnique({
          where: { email: adminCredentials.email },
        });
        const token = await prisma.token.findFirst({
          where: { userId: adminUser!.id, type: TokenType.PASSWORD_RESET, usedAt: null },
        });
        expect(token).not.toBeNull();
      });

      it('should return 400 for invalid email format', () => {
        return request(app.getHttpServer())
          .post('/api/auth/forgot-password')
          .send({ email: 'not-an-email' })
          .expect(400);
      });
    });

    describe('POST /api/auth/reset-password', () => {
      it('should reset password with a valid token', async () => {
        // Seed a reset token directly (bypassing email)
        const rawToken = 'e2e-reset-token-abcdef1234567890abcdef1234567890';
        const hashedToken = createHash('sha256').update(rawToken).digest('hex');
        const e2eUser = await prisma.user.findUnique({ where: { email: testUser.email } });

        if (e2eUser) {
          await prisma.token.create({
            data: {
              userId: e2eUser.id,
              token: hashedToken,
              type: TokenType.PASSWORD_RESET,
              expiresAt: new Date(Date.now() + 3600000),
            },
          });

          await request(app.getHttpServer())
            .post('/api/auth/reset-password')
            .send({ token: rawToken, password: 'NewPass@456' })
            .expect(200);

          // Old password should no longer work
          await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(401);
        }
      });

      it('should return 400 for an invalid token', () => {
        return request(app.getHttpServer())
          .post('/api/auth/reset-password')
          .send({ token: 'completely-invalid-token', password: 'NewPass@456' })
          .expect(400);
      });

      it('should return 400 for weak new password', () => {
        return request(app.getHttpServer())
          .post('/api/auth/reset-password')
          .send({ token: 'any-token', password: '123' })
          .expect(400);
      });
    });

    describe('POST /api/auth/verify-email', () => {
      it('should verify email with a valid token', async () => {
        const rawToken = 'e2e-verify-token-abcdef1234567890abcdef1234567890';
        const hashedToken = createHash('sha256').update(rawToken).digest('hex');
        const adminUser = await prisma.user.findUnique({ where: { email: adminCredentials.email } });

        if (adminUser) {
          await prisma.token.create({
            data: {
              userId: adminUser.id,
              token: hashedToken,
              type: TokenType.EMAIL_VERIFICATION,
              expiresAt: new Date(Date.now() + 86400000),
            },
          });

          await prisma.user.update({
            where: { id: adminUser.id },
            data: { emailVerified: false },
          });

          await request(app.getHttpServer())
            .post('/api/auth/verify-email')
            .send({ token: rawToken })
            .expect(200);

          const updated = await prisma.user.findUnique({ where: { id: adminUser.id } });
          expect(updated?.emailVerified).toBe(true);

          // Restore
          await prisma.user.update({
            where: { id: adminUser.id },
            data: { emailVerified: true },
          });
        }
      });

      it('should return 400 for an invalid token', () => {
        return request(app.getHttpServer())
          .post('/api/auth/verify-email')
          .send({ token: 'invalid-token' })
          .expect(400);
      });
    });

    describe('POST /api/auth/resend-verification', () => {
      it('should return 200 even for non-existent email (no enumeration)', () => {
        return request(app.getHttpServer())
          .post('/api/auth/resend-verification')
          .send({ email: 'nobody@nowhere.com' })
          .expect(200);
      });

      it('should return 200 for existing unverified user and create new token', async () => {
        const adminUser = await prisma.user.findUnique({ where: { email: adminCredentials.email } });

        if (adminUser) {
          // Temporarily mark as unverified
          await prisma.user.update({
            where: { id: adminUser.id },
            data: { emailVerified: false },
          });

          await request(app.getHttpServer())
            .post('/api/auth/resend-verification')
            .send({ email: adminCredentials.email })
            .expect(200);

          const token = await prisma.token.findFirst({
            where: { userId: adminUser.id, type: TokenType.EMAIL_VERIFICATION, usedAt: null },
          });
          expect(token).not.toBeNull();

          // Restore
          await prisma.user.update({
            where: { id: adminUser.id },
            data: { emailVerified: true },
          });
        }
      });
    });
  });

  // ============================================================
  // Users
  // ============================================================
  describe('Users', () => {
    describe('GET /api/users', () => {
      it('admin should get list of all users with pagination', () => {
        return request(app.getHttpServer())
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect(res => {
            const body = res.body.data || res.body;
            // Paginated response has data array and meta
            if (body.data) {
              expect(Array.isArray(body.data)).toBe(true);
              expect(body.meta).toBeDefined();
              expect(body.meta.total).toBeGreaterThan(0);
            } else {
              expect(Array.isArray(body)).toBe(true);
            }
          });
      });

      it('should support pagination parameters', () => {
        return request(app.getHttpServer())
          .get('/api/users?page=1&limit=5')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });

      it('should support search parameter', () => {
        return request(app.getHttpServer())
          .get('/api/users?search=admin')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });

      it('regular user should be denied access', async () => {
        // Re-login to get fresh token
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: testUser.email, password: testUser.password });

        const freshUserToken = (res.body.data || res.body).accessToken;

        return request(app.getHttpServer())
          .get('/api/users')
          .set('Authorization', `Bearer ${freshUserToken}`)
          .expect(403);
      });
    });

    describe('GET /api/users/:id', () => {
      it('admin should get any user by ID', () => {
        return request(app.getHttpServer())
          .get(`/api/users/${createdUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect(res => {
            const data = res.body.data || res.body;
            expect(data.id).toBe(createdUserId);
            expect(data).not.toHaveProperty('password');
          });
      });

      it('should return 404 for non-existent user', () => {
        return request(app.getHttpServer())
          .get('/api/users/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should return 400 for invalid UUID', () => {
        return request(app.getHttpServer())
          .get('/api/users/not-a-uuid')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });
    });

    describe('PATCH /api/users/:id', () => {
      it('admin should be able to update any user', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: testUser.email, password: testUser.password });

        const freshUserToken = (res.body.data || res.body).accessToken;
        const userId = (res.body.data || res.body).user.id;

        return request(app.getHttpServer())
          .patch(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Updated Test Name' })
          .expect(200)
          .expect(res => {
            const data = res.body.data || res.body;
            expect(data.name).toBe('Updated Test Name');
          });
      });
    });
  });

  // ============================================================
  // Error Handling
  // ============================================================
  describe('Error Handling', () => {
    it('should return structured error for 404', () => {
      return request(app.getHttpServer())
        .get('/api/non-existent-route')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 401 for requests without auth token', () => {
      return request(app.getHttpServer()).get('/api/users').expect(401);
    });
  });
});
