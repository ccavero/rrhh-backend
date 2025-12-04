import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso } from './permiso.entity';

interface CrearPermisoDto {
  tipo: string;
  motivo?: string;
  fecha_inicio: string; // '2025-12-10'
  fecha_fin: string;
  id_solicitante: string;
}

interface ResolverPermisoDto {
  estado: 'APROBADO' | 'RECHAZADO';
  id_resolvedor: string;
}

@Injectable()
export class PermisoService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepo: Repository<Permiso>,
  ) {}

  async crear(dto: CrearPermisoDto) {
    const permiso = this.permisoRepo.create({
      ...dto,
      estado: 'PENDIENTE',
    });
    return this.permisoRepo.save(permiso);
  }

  async listarTodos() {
    return this.permisoRepo.find({
      order: { creado_en: 'DESC' },
    });
  }

  async listarPendientes() {
    return this.permisoRepo.find({
      where: { estado: 'PENDIENTE' },
      order: { creado_en: 'ASC' },
    });
  }

  async resolver(id_permiso: string, dto: ResolverPermisoDto) {
    const permiso = await this.permisoRepo.findOne({
      where: { id_permiso },
    });

    if (!permiso) {
      throw new Error('Permiso no encontrado'); // luego se puede cambiar a HttpException
    }

    permiso.estado = dto.estado;
    permiso.id_resolvedor = dto.id_resolvedor;
    permiso.resuelto_en = new Date();

    return this.permisoRepo.save(permiso);
  }
}
