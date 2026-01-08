import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso } from '../entities/permiso.entity';
import {
  CrearPermisoDto,
  ActualizarEstadoPermisoDto,
  PermisoResponseDto,
} from '../dto/permiso.dto';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Injectable()
export class PermisoService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepo: Repository<Permiso>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async crear(
    dto: CrearPermisoDto,
    id_solicitante: string,
  ): Promise<PermisoResponseDto> {
    const solicitante = await this.usuarioRepo.findOne({
      where: { id_usuario: id_solicitante },
    });

    if (!solicitante) {
      throw new BadRequestException('El solicitante no existe.');
    }

    if (new Date(dto.fecha_fin) < new Date(dto.fecha_inicio)) {
      throw new BadRequestException(
        'La fecha final no puede ser anterior a la inicial.',
      );
    }

    const permiso = this.permisoRepo.create({
      ...dto,
      id_solicitante,
      estado: 'PENDIENTE',
    });

    const guardado = await this.permisoRepo.save(permiso);

    return (await this.permisoRepo.findOne({
      where: { id_permiso: guardado.id_permiso },
      relations: ['solicitante', 'resolvedor'],
    })) as PermisoResponseDto;
  }

  async listarPendientes(): Promise<PermisoResponseDto[]> {
    const permisos = await this.permisoRepo.find({
      where: { estado: 'PENDIENTE' },
      relations: ['solicitante', 'resolvedor'],
      order: { creado_en: 'DESC' },
    });

    return permisos as PermisoResponseDto[];
  }

  async resolver(
    id: string,
    dto: ActualizarEstadoPermisoDto,
    id_resolvedor: string,
  ): Promise<PermisoResponseDto> {
    const permiso = await this.permisoRepo.findOne({
      where: { id_permiso: id },
      relations: ['solicitante', 'resolvedor'],
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado.');
    }

    if (permiso.id_solicitante === id_resolvedor) {
      throw new BadRequestException(
        'El solicitante no puede resolver su propio permiso.',
      );
    }

    permiso.estado = dto.estado;
    permiso.id_resolvedor = id_resolvedor;
    permiso.resuelto_en = new Date();

    await this.permisoRepo.save(permiso);

    return (await this.permisoRepo.findOne({
      where: { id_permiso: id },
      relations: ['solicitante', 'resolvedor'],
    })) as PermisoResponseDto;
  }

  // ======================================================
  // LISTAR PERMISOS POR SOLICITANTE
  // ======================================================
  async listarPorSolicitante(
    id_solicitante: string,
  ): Promise<PermisoResponseDto[]> {
    const permisos = await this.permisoRepo.find({
      where: { id_solicitante },
      relations: ['solicitante', 'resolvedor'],
      order: { creado_en: 'DESC' },
    });

    return permisos as PermisoResponseDto[];
  }
}
