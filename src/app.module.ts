import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';

import { UsuarioModule } from './usuario/usuario.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { PermisoModule } from './permiso/permiso.module';
import { AuthModule } from './auth/auth.module';
import { CargoModule } from './cargo/cargo.module';
import { TareaModule } from './tarea/tarea.module';

import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './audit/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),

    AuditModule, // ✅ nuevo

    UsuarioModule,
    CargoModule,
    TareaModule,
    AsistenciaModule,
    PermisoModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}