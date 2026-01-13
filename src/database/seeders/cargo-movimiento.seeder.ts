import { INestApplicationContext } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { CargoMovimiento, TipoMovimientoCargo } from '../../cargo/entities/cargo-movimiento.entity';
import { Cargo } from '../../cargo/entities/cargo.entity';
import { Unidad } from '../../cargo/entities/unidad.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

export class CargoMovimientoSeeder {
    private movRepo: Repository<CargoMovimiento>;
    private cargoRepo: Repository<Cargo>;
    private unidadRepo: Repository<Unidad>;
    private usuarioRepo: Repository<Usuario>;
    private dataSource: DataSource;

    constructor(app: INestApplicationContext) {
        const ds = app.get(DataSource);
        this.dataSource = ds;
        this.movRepo = ds.getRepository(CargoMovimiento);
        this.cargoRepo = ds.getRepository(Cargo);
        this.unidadRepo = ds.getRepository(Unidad);
        this.usuarioRepo = ds.getRepository(Usuario);
    }

    async run() {
        console.log('============================================');
        console.log(' 🧩 INICIANDO SEEDER DE MOVIMIENTOS DE CARGO');
        console.log('============================================');

        const existentes = await this.movRepo.count();
        if (existentes > 0) {
            console.log('⚠ Ya existen movimientos de cargo. No se insertarán nuevos.');
            console.log('============================================\n');
            return;
        }

        const admin = await this.usuarioRepo.findOne({ where: { id_rol: 'ADMIN', estado: 'ACTIVO' } as any });
        const rrhh = await this.usuarioRepo.findOne({ where: { id_rol: 'RRHH', estado: 'ACTIVO' } as any });

        const funcionarios = await this.usuarioRepo.find({
            where: { id_rol: 'FUNCIONARIO', estado: 'ACTIVO' } as any,
            order: { creado_en: 'ASC' as any },
        });

        if (!rrhh && !admin) {
            console.log('⚠ No hay ADMIN/RRHH para "creado_por". Saltando movimientos.');
            console.log('============================================\n');
            return;
        }
        if (!funcionarios.length) {
            console.log('⚠ No hay FUNCIONARIOS. Saltando movimientos.');
            console.log('============================================\n');
            return;
        }

        const creadoPor = rrhh?.id_usuario ?? admin!.id_usuario;

        const cargos = await this.cargoRepo.find({ order: { nombre: 'ASC' as any } });
        const unidades = await this.unidadRepo.find({ order: { nombre: 'ASC' as any } });

        if (!cargos.length || !unidades.length) {
            console.log('⚠ Faltan cargos o unidades. Ejecuta CargoSeeder/UnidadSeeder primero.');
            console.log('============================================\n');
            return;
        }

        // Helper YYYY-MM-DD
        const ymd = (s: string) => s;

        // 1) INICIAL para todos los funcionarios (Cargo 1 / Unidad 1)
        const iniciales: Partial<CargoMovimiento>[] = funcionarios.map((u, idx) => ({
            id_usuario: u.id_usuario,
            tipo: 'INICIAL' as TipoMovimientoCargo,
            id_cargo: cargos[idx % cargos.length]!.id_cargo,
            id_unidad: unidades[idx % unidades.length]!.id_unidad,
            fecha_inicio: ymd('2025-12-01'),
            fecha_fin: null, // activo
            observacion: 'Seeder: cargo inicial',
            creado_por: creadoPor,
        }));

        await this.movRepo.save(iniciales as any);

        // 2) Un par de movimientos extra para trazabilidad (ASCENSO / REASIGNACION)
        // Elegimos 2 funcionarios si existen
        const f1 = funcionarios[0];
        const f2 = funcionarios[1];

        await this.dataSource.transaction(async (manager) => {
            const movRepoTx = manager.getRepository(CargoMovimiento);

            // f1: ASCENSO (cierra el activo y crea nuevo)
            if (f1) {
                const activo = await movRepoTx.findOne({
                    where: { id_usuario: f1.id_usuario, fecha_fin: null as any } as any,
                    order: { fecha_inicio: 'DESC' as any },
                });

                if (activo) {
                    await movRepoTx.update({ id_movimiento: activo.id_movimiento }, { fecha_fin: ymd('2026-01-01') });
                }

                await movRepoTx.save(
                    movRepoTx.create({
                        id_usuario: f1.id_usuario,
                        tipo: 'ASCENSO',
                        id_cargo: cargos[Math.min(1, cargos.length - 1)]!.id_cargo, // Supervisor 1 si existe
                        id_unidad: unidades[0]!.id_unidad,
                        fecha_inicio: ymd('2026-01-01'),
                        fecha_fin: null,
                        observacion: 'Seeder: ascenso',
                        creado_por: creadoPor,
                    }),
                );
            }

            // f2: REASIGNACION
            if (f2) {
                const activo = await movRepoTx.findOne({
                    where: { id_usuario: f2.id_usuario, fecha_fin: null as any } as any,
                    order: { fecha_inicio: 'DESC' as any },
                });

                if (activo) {
                    await movRepoTx.update({ id_movimiento: activo.id_movimiento }, { fecha_fin: ymd('2026-01-05') });
                }

                await movRepoTx.save(
                    movRepoTx.create({
                        id_usuario: f2.id_usuario,
                        tipo: 'REASIGNACION',
                        id_cargo: cargos[0]!.id_cargo,
                        id_unidad: unidades[Math.min(1, unidades.length - 1)]!.id_unidad,
                        fecha_inicio: ymd('2026-01-05'),
                        fecha_fin: null,
                        observacion: 'Seeder: reasignación de unidad',
                        creado_por: creadoPor,
                    }),
                );
            }
        });

        console.log('✓ Movimientos de cargo insertados correctamente');
        console.log('============================================\n');
    }
}