import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const userPassword = await bcrypt.hash('User@123456', 12);
  const now = new Date();

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: now,
    },
  });

  console.log(`Created/updated admin user: ${admin.email}`);

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: Role.USER,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: now,
    },
  });

  console.log(`Created/updated regular user: ${user.email}`);

  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'CREATE',
        resource: 'USER',
        resourceId: admin.id,
        metadata: { note: 'Admin user created via seed' },
        ipAddress: '127.0.0.1',
        userAgent: 'seed-script',
      },
      {
        userId: admin.id,
        action: 'CREATE',
        resource: 'USER',
        resourceId: user.id,
        metadata: { note: 'Regular user created via seed' },
        ipAddress: '127.0.0.1',
        userAgent: 'seed-script',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Audit logs created.');
  console.log('Seed completed successfully!');
  console.log('\nCredentials:');
  console.log('  Admin - email: admin@example.com, password: Admin@123456');
  console.log('  User  - email: user@example.com,  password: User@123456');
}

main()
  .catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
