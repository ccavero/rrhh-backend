// src/tarea/services/tarea.service.ts
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tarea, EstadoTarea } from '../entities/tarea.entity';
import {
    CrearTareaDto,
    CambiarEstadoTareaDto,
    ActualizarTareaDto,
} from '../dto/tarea.dto';
import { Usuario } from '../../usuario/entities/usuario.entity';

type UsuarioAuth = {
    id_usuario: string;
    id_rol: 'ADMIN' | 'RRHH' | 'FUNCIONARIO' | string;
};

@Injectable()
export class TareaService {
    constructor(
        @InjectRepository(Tarea) private readonly tareaRepo: Repository<Tarea>,
        @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    ) {}

    private assertResponsable(actor: UsuarioAuth) {
        if (!actor || (actor.id_rol !== 'ADMIN' && actor.id_rol !== 'RRHH')) {
            throw new ForbiddenException('No tiene permisos para gestionar tareas');
        }
    }

    private async assertUsuarioExiste(id_usuario: string) {
        const u = await this.usuarioRepo.findOne({ where: { id_usuario } });
        if (!u) throw new NotFoundException('Usuario no encontrado');
        return u;
    }

    async crear(actor: UsuarioAuth, dto: CrearTareaDto) {
        this.assertResponsable(actor);
        await this.assertUsuarioExiste(dto.id_asignado_a);

        const tarea = this.tareaRepo.create({
            titulo: dto.titulo.trim(),
            descripcion: dto.descripcion?.trim() || null,
            estado: 'PENDIENTE',
            fecha_limite: dto.fecha_limite ?? null,
            id_asignado_por: actor.id_usuario,
            id_asignado_a: dto.id_asignado_a,
        });

        return this.tareaRepo.save(tarea);
    }

    async todas(actor: UsuarioAuth) {
        this.assertResponsable(actor);

        return this.tareaRepo.find({
            order: { creado_en: 'DESC' as any },
            relations: { asignadoPor: true, asignadoA: true },
        });
    }

    async deUsuario(actor: UsuarioAuth, id_usuario: string) {
        this.assertResponsable(actor);

        return this.tareaRepo.find({
            where: { id_asignado_a: id_usuario },
            order: { creado_en: 'DESC' as any },
            relations: { asignadoPor: true, asignadoA: true },
        });
    }

    async mias(actor: UsuarioAuth) {
        if (!actor?.id_usuario) throw new ForbiddenException('No autenticado');

        return this.tareaRepo.find({
            where: { id_asignado_a: actor.id_usuario },
            order: { creado_en: 'DESC' as any },
            relations: { asignadoPor: true },
        });
    }

    async asignadasPorMi(actor: UsuarioAuth) {
        this.assertResponsable(actor);

        return this.tareaRepo.find({
            where: { id_asignado_por: actor.id_usuario },
            order: { creado_en: 'DESC' as any },
            relations: { asignadoA: true },
        });
    }

    async cambiarEstado(
        actor: UsuarioAuth,
        id_tarea: string,
        dto: CambiarEstadoTareaDto,
    ) {
        if (!actor?.id_usuario) throw new ForbiddenException('No autenticado');

        const tarea = await this.tareaRepo.findOne({ where: { id_tarea } });
        if (!tarea) throw new NotFoundException('Tarea no encontrada');

        const esGestor = actor.id_rol === 'ADMIN' || actor.id_rol === 'RRHH';
        if (!esGestor && tarea.id_asignado_a !== actor.id_usuario) {
            throw new ForbiddenException('No puede modificar esta tarea');
        }

        tarea.estado = dto.estado as EstadoTarea;
        return this.tareaRepo.save(tarea);
    }

    async actualizar(actor: UsuarioAuth, id_tarea: string, dto: ActualizarTareaDto) {
        this.assertResponsable(actor);

        const tarea = await this.tareaRepo.findOne({
            where: { id_tarea },
            relations: { asignadoPor: true, asignadoA: true },
        });
        if (!tarea) throw new NotFoundException('Tarea no encontrada');

        if (dto.titulo !== undefined) {
            const t = dto.titulo.trim();
            tarea.titulo = t;
        }

        if (dto.descripcion !== undefined) {
            if (dto.descripcion === null) {
                tarea.descripcion = null;
            } else {
                const d = String(dto.descripcion).trim();
                tarea.descripcion = d.length ? d : null;
            }
        }

        if (dto.fecha_limite !== undefined) {
            tarea.fecha_limite = dto.fecha_limite ?? null;
        }

        if (dto.id_asignado_a !== undefined) {
            await this.assertUsuarioExiste(dto.id_asignado_a);
            tarea.id_asignado_a = dto.id_asignado_a;
        }

        const saved = await this.tareaRepo.save(tarea);

        return this.tareaRepo.findOne({
            where: { id_tarea: saved.id_tarea },
            relations: { asignadoPor: true, asignadoA: true },
        });
    }
}