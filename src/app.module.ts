import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './usuario/usuario.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { PermisoModule } from './permiso/permiso.module';
import { AuthModule } from './auth/auth.module';
import { CorsController } from './common/controllers/cors.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASS,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsuarioModule,
    AsistenciaModule,
    PermisoModule,
    AuthModule,
  ],
  controllers: [CorsController],
  providers: [],
})
export class AppModule {}
