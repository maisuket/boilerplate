import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  public readonly extended = this.$extends({
    query: {
      user: {
        delete: ({ args }) => {
          return this.user.update({
            ...args,
            data: { deletedAt: new Date() },
          }) as any;
        },
        deleteMany: ({ args }) => {
          return this.user.updateMany({
            ...args,
            data: { deletedAt: new Date() },
          }) as any;
        },
        findMany: ({ args, query }) => {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        findFirst: ({ args, query }) => {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        findUnique: ({ args }) => {
          return this.user.findFirst({
            ...args,
            where: { ...args.where, deletedAt: null },
          }) as any;
        },
      },
    },
  });

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }
    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter(name => name !== '_prisma_migrations')
      .map(name => `"public"."${name}"`)
      .join(', ');

    try {
      await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      this.logger.error('Error cleaning database:', error);
    }
  }
}
