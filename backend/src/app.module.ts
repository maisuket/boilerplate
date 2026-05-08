import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { ScheduleModule } from '@nestjs/schedule';
import * as winston from 'winston';
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
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
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

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    MailModule,
  ],
  providers: [
    // Global rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global JWT auth guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global roles guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global transform interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Global logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
