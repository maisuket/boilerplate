import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { ScheduleModule } from '@nestjs/schedule';
import * as winston from 'winston';
import * as Joi from 'joi';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { MailModule } from './mail/mail.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { AuditInterceptor } from './shared/interceptors/audit.interceptor';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';

@Module({
  imports: [
    // Configuration — validates required env vars before anything else boots
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().default(3001),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        MAIL_HOST: Joi.string().default('localhost'),
        MAIL_PORT: Joi.number().default(1025),
        MAIL_FROM: Joi.string().default('noreply@example.com'),
        THROTTLE_TTL: Joi.number().default(60000),
        THROTTLE_LIMIT: Joi.number().default(100),
      }),
      validationOptions: { abortEarly: false, allowUnknown: true },
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttle.ttl') || 60000,
          limit: configService.get<number>('throttle.limit') || 100,
        },
      ],
      inject: [ConfigService],
    }),

    // Logging with Winston
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('nodeEnv') === 'production';
        return {
          transports: [
            new winston.transports.Console({
              format: isProduction
                ? winston.format.combine(winston.format.timestamp(), winston.format.json())
                : winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    winston.format.printf(({ timestamp, level, message, context, trace }) => {
                      return `${timestamp} [${context || 'App'}] ${level}: ${message}${trace ? '\n' + trace : ''}`;
                    }),
                  ),
            }),
            ...(isProduction
              ? [
                  new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    format: winston.format.combine(
                      winston.format.timestamp(),
                      winston.format.json(),
                    ),
                  }),
                  new winston.transports.File({
                    filename: 'logs/combined.log',
                    format: winston.format.combine(
                      winston.format.timestamp(),
                      winston.format.json(),
                    ),
                  }),
                ]
              : []),
          ],
        };
      },
      inject: [ConfigService],
    }),

    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    MailModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    // Persist audit trail for all mutating requests (POST/PUT/PATCH/DELETE)
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
