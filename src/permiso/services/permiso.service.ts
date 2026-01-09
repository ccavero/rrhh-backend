import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permiso, EstadoPermiso } from '../entities/permiso.entity';
import { CrearPermisoDto, ResolverPermisoDto, PermisoResponseDto } from '../dto/permiso.dto';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Injectable()
export class PermisoService {
  constructor(
      @InjectRepository(Permiso)
      private readonly permisoRepo: Repository<Permiso>,
      @InjectRepository(Usuario)
      private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async crear(dto: CrearPermisoDto, id_solicitante: string): Promise<PermisoResponseDto> {
    const solicitante = await this.usuarioRepo.findOne({
      where: { id_usuario: id_solicitante },
    });
    if (!solicitante) throw new BadRequestException('El solicitante no existe.');

    const inicio = new Date(dto.fecha_inicio);
    const fin = new Date(dto.fecha_fin);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      throw new BadRequestException('Fechas inválidas.');
    }
    if (fin < inicio) {
      throw new BadRequestException('La fecha final no puede ser anterior a la inicial.');
    }

    const permiso = this.permisoRepo.create({
      tipo: dto.tipo,
      motivo: dto.motivo,
      fecha_inicio: inicio,
      fecha_fin: fin,
      id_solicitante,
      estado: EstadoPermiso.PENDIENTE,
      con_goce: false,
      observacion_resolucion: null,
      id_resolvedor: null,
      resuelto_en: null,
    });

    const guardado = await this.permisoRepo.save(permiso);

    const full = await this.permisoRepo.findOne({
      where: { id_permiso: guardado.id_permiso },
      relations: ['solicitante', 'resolvedor'],
    });
    if (!full) throw new NotFoundException('Permiso no encontrado luego de guardar.');

    return full as unknown as PermisoResponseDto;
  }

  async listarPendientes(): Promise<PermisoResponseDto[]> {
    const permisos = await this.permisoRepo.find({
      where: { estado: EstadoPermiso.PENDIENTE },
      relations: ['solicitante', 'resolvedor'],
      order: { creado_en: 'DESC' as any },
    });
    return permisos as unknown as PermisoResponseDto[];
  }

  async listarPorSolicitante(id_solicitante: string): Promise<PermisoResponseDto[]> {
    const permisos = await this.permisoRepo.find({
      where: { id_solicitante },
      relations: ['solicitante', 'resolvedor'],
      order: { creado_en: 'DESC' as any },
    });
    return permisos as unknown as PermisoResponseDto[];
  }

  async resolver(
      id_permiso: string,
      dto: ResolverPermisoDto,
      id_resolvedor: string,
  ): Promise<PermisoResponseDto> {
    const permiso = await this.permisoRepo.findOne({
      where: { id_permiso },
      relations: ['solicitante', 'resolvedor'],
    });
    if (!permiso) throw new NotFoundException('Permiso no encontrado.');

    if (permiso.id_solicitante === id_resolvedor) {
      throw new BadRequestException('El solicitante no puede resolver su propio permiso.');
    }

    if (permiso.estado !== EstadoPermiso.PENDIENTE) {
      throw new BadRequestException('Solo se pueden resolver permisos PENDIENTE.');
    }

    const resolvedor = await this.usuarioRepo.findOne({
      where: { id_usuario: id_resolvedor },
    });
    if (!resolvedor) throw new BadRequestException('El resolvedor no existe.');

    permiso.estado = dto.estado;
    permiso.id_resolvedor = id_resolvedor;
    permiso.resuelto_en = new Date();

    if (dto.estado === EstadoPermiso.RECHAZADO) {
      permiso.con_goce = false;
    } else {
      permiso.con_goce = dto.con_goce ?? false;
    }

    permiso.observacion_resolucion = dto.observacion_resolucion ?? null;

    await this.permisoRepo.save(permiso);

    const full = await this.permisoRepo.findOne({
      where: { id_permiso },
      relations: ['solicitante', 'resolvedor'],
    });
    if (!full) throw new NotFoundException('Permiso no encontrado luego de resolver.');

    return full as unknown as PermisoResponseDto;
  }

  async tienePermisoAprobadoEnFecha(
      id_usuario: string,
      fecha: Date,
  ): Promise<{ bloquea: boolean; con_goce?: boolean; permiso?: Permiso }> {
    const ymd = fecha.toISOString().slice(0, 10);

    const permiso = await this.permisoRepo
        .createQueryBuilder('p')
        .where('p.id_solicitante = :id', { id: id_usuario })
        .andWhere('p.estado = :estado', { estado: EstadoPermiso.APROBADO })
        .andWhere('p.fecha_inicio <= :ymd AND p.fecha_fin >= :ymd', { ymd })
        .getOne();

    if (!permiso) return { bloquea: false };
    return { bloquea: true, con_goce: permiso.con_goce, permiso };
  }
}