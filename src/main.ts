import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS para desarrollo con Next.js
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // ---- SWAGGER CONFIG ----
  const config = new DocumentBuilder()
    .setTitle('API - Sistema de Administración de Personal')
    .setDescription('Documentación de la API (Desarrollo)')
    .setVersion('1.0')
    .addBearerAuth() // permite usar JWT en Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // url base: http://localhost:4000/api
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(4000);
}

void bootstrap();
