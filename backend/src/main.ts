import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Winston logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3001;
  const nodeEnv = configService.get<string>('nodeEnv');
  const appUrl = configService.get<string>('appUrl');

  // Trust the first proxy hop so request.ip resolves to the real client IP
  // (required for correct rate-limiting and audit logging behind nginx/load balancer)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Global prefix
  app.setGlobalPrefix('api');

  // Habilita o versionamento de rotas (ex: /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Security headers
  app.use(helmet.default());

  // Gzip compression
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin:
      nodeEnv === 'production'
        ? [appUrl as string]
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false,
    }),
  );

  // Global class serializer (respects @Exclude decorators)
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  // Swagger documentation setup
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NestJS Boilerplate API')
      .setDescription(
        'A comprehensive NestJS backend boilerplate with JWT auth, RBAC, pagination, and more.',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter your JWT access token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'Auth endpoints - login, register, refresh, logout')
      .addTag('Users', 'User management endpoints')
      .addTag('Health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'method',
      },
      customSiteTitle: 'NestJS Boilerplate API Docs',
    });

    logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`, 'Bootstrap');
  }

  await app.listen(port);

  logger.log(`Application running on: http://localhost:${port}/api`, 'Bootstrap');
  logger.log(`Environment: ${nodeEnv}`, 'Bootstrap');
}

bootstrap().catch(err => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', err);
  process.exit(1);
});
