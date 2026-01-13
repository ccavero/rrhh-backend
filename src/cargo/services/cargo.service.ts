import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';

import { Cargo } from '../entities/cargo.entity';
import { Unidad } from '../entities/unidad.entity';
import { CargoMovimiento, TipoMovimientoCargo } from '../entities/cargo-movimiento.entity';

import { CrearCargoDto } from '../dto/cargo.dto';
import { CrearUnidadDto } from '../dto/unidad.dto';
import { RegistrarMovimientoCargoDto } from '../dto/movimiento.dto';

import { Usuario } from '../../usuario/entities/usuario.entity';

type UsuarioAuth = {
    id_usuario: string;
    id_rol: 'ADMIN' | 'RRHH' | 'FUNCIONARIO' | string;
};

@Injectable()
export class CargoService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Cargo) private readonly cargoRepo: Repository<Cargo>,
        @InjectRepository(Unidad) private readonly unidadRepo: Repository<Unidad>,
        @InjectRepository(CargoMovimiento)
        private readonly movRepo: Repository<CargoMovimiento>,
        @InjectRepository(Usuario)
        private readonly usuarioRepo: Repository<Usuario>,
    ) {}

    private assertGestor(actor: UsuarioAuth) {
        if (!actor || (actor.id_rol !== 'ADMIN' && actor.id_rol !== 'RRHH')) {
            throw new ForbiddenException('No tiene permisos para realizar esta acción');
        }
    }

    private async assertUsuarioExiste(id_usuario: string) {
        const u = await this.usuarioRepo.findOne({ where: { id_usuario } });
        if (!u) throw new NotFoundException('Usuario no encontrado');
        return u;
    }

    private async assertCargoExiste(id_cargo: string) {
        const c = await this.cargoRepo.findOne({ where: { id_cargo } });
        if (!c) throw new NotFoundException('Cargo no encontrado');
        return c;
    }

    private async assertUnidadExiste(id_unidad: string) {
        const u = await this.unidadRepo.findOne({ where: { id_unidad } });
        if (!u) throw new NotFoundException('Unidad no encontrada');
        return u;
    }

    private async getMovimientoActivo(id_usuario: string) {
        return this.movRepo.findOne({
            where: { id_usuario, fecha_fin: IsNull() }, // ✅ Activo = fecha_fin null
            order: { fecha_inicio: 'DESC' as any },
        });
    }

    async crearCargo(actor: UsuarioAuth, dto: CrearCargoDto) {
        this.assertGestor(actor);

        const codigo = dto.codigo?.trim() ? dto.codigo.trim() : null;

        if (codigo) {
            const existe = await this.cargoRepo.findOne({ where: { codigo } });
            if (existe) throw new BadRequestException('El código de cargo ya existe');
        }

        const cargo = this.cargoRepo.create({
            codigo,
            nombre: dto.nombre.trim(),
            activo: dto.activo ?? true,
        });

        return this.cargoRepo.save(cargo);
    }

    async listarCargos(actor: UsuarioAuth) {
        this.assertGestor(actor);
        return this.cargoRepo.find({ order: { nombre: 'ASC' } });
    }

    async crearUnidad(actor: UsuarioAuth, dto: CrearUnidadDto) {
        this.assertGestor(actor);

        const nombre = dto.nombre.trim();
        const existe = await this.unidadRepo.findOne({ where: { nombre } });
        if (existe) throw new BadRequestException('La unidad ya existe');

        const unidad = this.unidadRepo.create({
            nombre,
            activo: dto.activo ?? true,
        });

        return this.unidadRepo.save(unidad);
    }

    async listarUnidades(actor: UsuarioAuth) {
        this.assertGestor(actor);
        return this.unidadRepo.find({ order: { nombre: 'ASC' } });
    }

    async registrarMovimiento(
        actor: UsuarioAuth,
        id_usuario: string,
        dto: RegistrarMovimientoCargoDto,
    ) {
        this.assertGestor(actor);
        await this.assertUsuarioExiste(id_usuario);

        const tipo = dto.tipo as TipoMovimientoCargo;

        if (tipo !== 'BAJA') {
            if (!dto.id_cargo) throw new BadRequestException('Debe enviar id_cargo');
            if (!dto.id_unidad) throw new BadRequestException('Debe enviar id_unidad');
            await this.assertCargoExiste(dto.id_cargo);
            await this.assertUnidadExiste(dto.id_unidad);
        }

        const activo = await this.getMovimientoActivo(id_usuario);

        if (tipo === 'INICIAL') {
            if (activo) {
                throw new BadRequestException(
                    'El usuario ya tiene un cargo activo. Use ASCENSO/REASIGNACION o BAJA.',
                );
            }
        } else {
            if (!activo) {
                throw new BadRequestException(
                    'El usuario no tiene cargo activo. Primero registre INICIAL.',
                );
            }
        }

        await this.dataSource.transaction(async (manager) => {
            const movRepoTx = manager.getRepository(CargoMovimiento);

            if (activo) {
                await movRepoTx.update(
                    { id_movimiento: activo.id_movimiento },
                    { fecha_fin: dto.fecha_inicio },
                );
            }

            const nuevo = movRepoTx.create({
                id_usuario,
                tipo,
                id_cargo: tipo === 'BAJA' ? null : dto.id_cargo!,
                id_unidad: tipo === 'BAJA' ? null : dto.id_unidad!,
                fecha_inicio: dto.fecha_inicio,
                fecha_fin: null,
                observacion: dto.observacion?.trim() || null,
                creado_por: actor.id_usuario,
            });

            await movRepoTx.save(nuevo);
        });

        return this.movimientosDeUsuario(actor, id_usuario);
    }

    async movimientosDeUsuario(actor: UsuarioAuth, id_usuario: string) {
        this.assertGestor(actor);
        await this.assertUsuarioExiste(id_usuario);

        const movimientos = await this.movRepo.find({
            where: { id_usuario },
            order: { fecha_inicio: 'DESC' as any, creado_en: 'DESC' as any },
        });

        const activo = movimientos.find((m) => m.fecha_fin == null) ?? null;

        return { id_usuario, activo, movimientos };
    }
}