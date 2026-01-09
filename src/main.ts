import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function parseAllowedOrigins(): string[] {
  // FRONTEND_URL puede ser:
  // - un solo origin: http://localhost:3000
  // - varios separados por coma: http://localhost:3000,http://127.0.0.1:3000
  const raw = process.env.FRONTEND_URL;

  if (raw) {
    return raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
  }

  // fallback dev
  const port = process.env.FRONTEND_PORT ?? '3000';
  return [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =====================================================
  // CORS
  // =====================================================
  const allowedOrigins = parseAllowedOrigins();

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin Origin (Postman, curl, healthchecks)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
          new Error(`CORS bloqueado para el origin: ${origin}`),
          false,
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });

  // =====================================================
  // SWAGGER
  // =====================================================
  const swaggerConfig = new DocumentBuilder()
      .setTitle('API - Sistema de Administración de Personal')
      .setDescription('Documentación de la API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // =====================================================
  // SERVER
  // =====================================================
  const port = Number(process.env.PORT ?? 4000);

  await app.listen(port, '0.0.0.0');

  // eslint-disable-next-line no-console
  console.log(`✅ Backend running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`📚 Swagger available at http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`🌐 Allowed CORS origins:`, allowedOrigins);
}

void bootstrap();