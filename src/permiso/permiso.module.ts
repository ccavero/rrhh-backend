import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Permiso } from './entities/permiso.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

import { PermisoService } from './services/permiso.service';
import { PermisoController } from './controllers/permiso.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Permiso, Usuario])],
  controllers: [PermisoController],
  providers: [PermisoService],
  exports: [PermisoService], // 👈 CLAVE para usarlo desde Asistencia
})
export class PermisoModule {}