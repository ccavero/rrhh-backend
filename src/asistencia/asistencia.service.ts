import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asistencia } from './asistencia.entity';

interface CrearAsistenciaDto {
  id_usuario: string;
  tipo: string;       // 'entrada' | 'salida'
  origen?: string;
  ip_registro?: string;
}

@Injectable()
export class AsistenciaService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistenciaRepo: Repository<Asistencia>,
  ) {}

  async crear(dto: CrearAsistenciaDto) {
    const registro = this.asistenciaRepo.create({
      ...dto,
      estado: 'VALIDA',
    });
    return this.asistenciaRepo.save(registro);
  }

  async listarTodas() {
    return this.asistenciaRepo.find({
      order: { fecha_hora: 'DESC' },
    });
  }
}
