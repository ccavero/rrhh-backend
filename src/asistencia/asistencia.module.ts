import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from './asistencia.entity';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Asistencia])],
  providers: [AsistenciaService],
  controllers: [AsistenciaController],
})
export class AsistenciaModule {}
