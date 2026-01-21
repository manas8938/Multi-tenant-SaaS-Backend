import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// Fix BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Security
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  if (configService.get<string>('SWAGGER_ENABLED') === 'true') {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('SWAGGER_TITLE', 'SaaS Backend API'))
      .setDescription(
        configService.get<string>(
          'SWAGGER_DESCRIPTION',
          'Multi-tenant SaaS Backend API',
        ),
      )
      .setVersion(configService.get<string>('SWAGGER_VERSION', '1.0'))
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-Tenant-Id',
          in: 'header',
          description: 'Tenant ID',
        },
        'X-Tenant-Id',
      )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Tenants', 'Tenant management endpoints')
      .addTag('Subscriptions', 'Subscription management endpoints')
      .addTag('Health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
      configService.get<string>('SWAGGER_PATH', 'docs'),
      app,
      document,
      {
        swaggerOptions: {
          persistAuthorization: true,
        },
      },
    );
  }

  const port = configService.get<number>('APP_PORT', 3000);
  await app.listen(port);

  console.log(`
  🚀 Application is running on: http://localhost:${port}/${apiPrefix}
  📚 Swagger docs: http://localhost:${port}/${configService.get<string>('SWAGGER_PATH', 'docs')}
  🏠 Environment: ${configService.get<string>('NODE_ENV')}
  `);
}

bootstrap();
