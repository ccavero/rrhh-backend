import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asistencia } from './entities/asistencia.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { JornadaLaboral } from '../usuario/entities/jornada-laboral.entity';

import { AsistenciaService } from './services/asistencia.service';
import { AsistenciaController } from './controllers/asistencia.controller';

import { PermisoModule } from '../permiso/permiso.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asistencia, Usuario, JornadaLaboral]),
    PermisoModule,
  ],
  providers: [AsistenciaService],
  controllers: [AsistenciaController],
})
export class AsistenciaModule {}