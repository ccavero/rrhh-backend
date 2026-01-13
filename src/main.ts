import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function parseAllowedOrigins(): string[] {
  const raw = process.env.FRONTEND_URL;

  if (raw) {
    return raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
  }

  const port = process.env.FRONTEND_PORT ?? '3000';
  return [`http://localhost:${port}`, `http://127.0.0.1:${port}`, 'http://localhost:4000', 'http://127.0.0.1:4000'];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = parseAllowedOrigins();

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS bloqueado para el origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  });

  const swaggerConfig = new DocumentBuilder()
      .setTitle('API - Sistema de Administración de Personal')
      .setDescription('Documentación de la API')
      .setVersion('1.0')
      .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Pega aquí SOLO el token JWT (sin "Bearer ")',
          },
          'jwt', // 👈 NOMBRE del esquema
      )
      .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

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