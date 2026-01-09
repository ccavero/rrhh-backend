import { INestApplicationContext } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Asistencia } from '../../asistencia/entities/asistencia.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Permiso, EstadoPermiso } from '../../permiso/entities/permiso.entity';

export class AsistenciaSeeder {
    private asistenciaRepo: Repository<Asistencia>;
    private usuarioRepo: Repository<Usuario>;
    private permisoRepo: Repository<Permiso>;

    // Bolivia UTC-4 (sin DST)
    private static readonly BO_OFFSET_HOURS = -4;

    constructor(app: INestApplicationContext) {
        const dataSource = app.get(DataSource);
        this.asistenciaRepo = dataSource.getRepository(Asistencia);
        this.usuarioRepo = dataSource.getRepository(Usuario);
        this.permisoRepo = dataSource.getRepository(Permiso);
    }

    private pad2(n: number) {
        return String(n).padStart(2, '0');
    }

    private ymdUTC(date: Date) {
        return date.toISOString().slice(0, 10);
    }

    /**
     * Dado un día "Bolivia" (YYYY-MM-DD) y una hora Bolivia, genera el Date en UTC correcto.
     * Ej: 10:00 BO => 14:00 UTC (porque BO = UTC-4)
     */
    private dateAtBO(ymdBO: string, hhBO: number, mm: number, ss = 0) {
        const [y, m, d] = ymdBO.split('-').map(Number);
        const utcHour = hhBO - AsistenciaSeeder.BO_OFFSET_HOURS; // hhBO - (-4) = hhBO + 4
        return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, utcHour, mm, ss, 0));
    }

    /**
     * Día de semana en Bolivia para un YYYY-MM-DD (0=Dom..6=Sáb)
     * Para obtenerlo, construimos el instante 12:00 BO (16:00 UTC) y miramos el getUTCDay.
     */
    private getBoDayOfWeek(ymdBO: string): number {
        const dt = this.dateAtBO(ymdBO, 12, 0, 0);
        return dt.getUTCDay();
    }

    private isWeekendBO(ymdBO: string) {
        const d = this.getBoDayOfWeek(ymdBO);
        return d === 0 || d === 6;
    }

    private eachDayInclusiveBO(fromYmd: string, toYmd: string) {
        const out: string[] = [];

        const [fy, fm, fd] = fromYmd.split('-').map(Number);
        const [ty, tm, td] = toYmd.split('-').map(Number);

        // usamos UTC noon para iterar días sin líos
        const cur = new Date(Date.UTC(fy, (fm ?? 1) - 1, fd ?? 1, 12, 0, 0, 0));
        const end = new Date(Date.UTC(ty, (tm ?? 1) - 1, td ?? 1, 12, 0, 0, 0));

        while (cur <= end) {
            out.push(this.ymdUTC(cur)); // esto da YYYY-MM-DD estable
            cur.setUTCDate(cur.getUTCDate() + 1);
        }
        return out;
    }

    async run() {
        console.log('============================================');
        console.log(' 🕒 INICIANDO SEEDER DE ASISTENCIAS');
        console.log('============================================');

        const existentes = await this.asistenciaRepo.count();
        if (existentes > 0) {
            console.log(
                '⚠ Ya existen asistencias. No se insertarán nuevas para evitar duplicados.',
            );
            console.log('============================================\n');
            return;
        }

        const usuarios = await this.usuarioRepo.find({
            where: { estado: 'ACTIVO' as any } as any,
            order: { creado_en: 'ASC' as any },
        });

        if (!usuarios.length) {
            console.log('⚠ No hay usuarios activos. Saltando asistencias.');
            console.log('============================================\n');
            return;
        }

        const admin = usuarios.find((u) => u.id_rol === 'ADMIN');
        const rrhh = usuarios.find((u) => u.id_rol === 'RRHH');
        const funcionarios = usuarios.filter((u) => u.id_rol === 'FUNCIONARIO');

        if (funcionarios.length < 7) {
            console.log(
                `⚠ Se esperaban 7 FUNCIONARIOS, pero hay ${funcionarios.length}. Ajusta el UserSeeder.`,
            );
        }

        const f = (i: number) => funcionarios[i];
        const func1 = f(0);
        const func2 = f(1);
        const func3 = f(2);
        const func4 = f(3);
        const func5 = f(4);
        const func6 = f(5);
        const func7 = f(6);

        const normales: Usuario[] = [admin, rrhh, func1, func2, func3, func4].filter(
            Boolean,
        ) as Usuario[];

        const irregulares: Usuario[] = [func5, func6, func7].filter(Boolean) as Usuario[];

        // Rango por calendario Bolivia (YYYY-MM-DD)
        const startBO = '2025-12-22';
        const endBO = '2026-01-08';

        // Permisos APROBADOS para omitir días (por calendario BO)
        const permisosAprobados = await this.permisoRepo.find({
            where: { estado: EstadoPermiso.APROBADO as any } as any,
        });

        const diasConPermisoPorUsuario = new Map<string, Set<string>>();
        for (const p of permisosAprobados) {
            const idUsuario = p.id_solicitante;
            const ini = this.ymdUTC(new Date(p.fecha_inicio));
            const fin = this.ymdUTC(new Date(p.fecha_fin));
            const dias = this.eachDayInclusiveBO(ini, fin);
            const set = diasConPermisoPorUsuario.get(idUsuario) ?? new Set<string>();
            for (const d of dias) set.add(d);
            diasConPermisoPorUsuario.set(idUsuario, set);
        }

        const rows: Asistencia[] = [];
        let dayIndex = 0;

        const dias = this.eachDayInclusiveBO(startBO, endBO);

        for (const diaBO of dias) {
            if (this.isWeekendBO(diaBO)) continue;

            // -------------------------
            // NORMALES: 10:00 - 18:00 (Bolivia) => 14:00Z - 22:00Z
            // -------------------------
            for (const u of normales) {
                const omitidos = diasConPermisoPorUsuario.get(u.id_usuario);
                if (omitidos?.has(diaBO)) continue;

                rows.push(
                    this.asistenciaRepo.create({
                        id_usuario: u.id_usuario,
                        fecha_hora: this.dateAtBO(diaBO, 10, 0, 0),
                        tipo: 'ENTRADA',
                        estado: 'VALIDA',
                        origen: 'manual',
                        ip_registro: null,
                        observacion: 'Seeder: normal',
                        id_validador: null,
                    }),
                    this.asistenciaRepo.create({
                        id_usuario: u.id_usuario,
                        fecha_hora: this.dateAtBO(diaBO, 18, 0, 0),
                        tipo: 'SALIDA',
                        estado: 'VALIDA',
                        origen: 'manual',
                        ip_registro: null,
                        observacion: 'Seeder: normal',
                        id_validador: null,
                    }),
                );
            }

            // -------------------------
            // IRREGULARES
            // -------------------------
            for (const u of irregulares) {
                const omitidos = diasConPermisoPorUsuario.get(u.id_usuario);
                if (omitidos?.has(diaBO)) continue;

                if (u.id_usuario === func5?.id_usuario) {
                    // func5: ATRASOS (10:15 / 10:25 / 10:35 BO) + salida normal 18:00
                    const atraso = [15, 25, 35][dayIndex % 3];
                    rows.push(
                        this.asistenciaRepo.create({
                            id_usuario: u.id_usuario,
                            fecha_hora: this.dateAtBO(diaBO, 10, atraso, 0),
                            tipo: 'ENTRADA',
                            estado: 'VALIDA',
                            origen: 'manual',
                            ip_registro: null,
                            observacion: `Seeder: atraso ${atraso}m`,
                            id_validador: null,
                        }),
                        this.asistenciaRepo.create({
                            id_usuario: u.id_usuario,
                            fecha_hora: this.dateAtBO(diaBO, 18, 0, 0),
                            tipo: 'SALIDA',
                            estado: 'VALIDA',
                            origen: 'manual',
                            ip_registro: null,
                            observacion: 'Seeder: salida normal',
                            id_validador: null,
                        }),
                    );
                } else if (u.id_usuario === func6?.id_usuario) {
                    // func6: SALIDAS ANTICIPADAS (17:00 o 17:30 BO), entrada normal 10:00
                    const salida = dayIndex % 2 === 0 ? { hh: 17, mm: 0 } : { hh: 17, mm: 30 };
                    rows.push(
                        this.asistenciaRepo.create({
                            id_usuario: u.id_usuario,
                            fecha_hora: this.dateAtBO(diaBO, 10, 0, 0),
                            tipo: 'ENTRADA',
                            estado: 'VALIDA',
                            origen: 'manual',
                            ip_registro: null,
                            observacion: 'Seeder: entrada normal',
                            id_validador: null,
                        }),
                        this.asistenciaRepo.create({
                            id_usuario: u.id_usuario,
                            fecha_hora: this.dateAtBO(diaBO, salida.hh, salida.mm, 0),
                            tipo: 'SALIDA',
                            estado: 'VALIDA',
                            origen: 'manual',
                            ip_registro: null,
                            observacion: `Seeder: salida anticipada ${this.pad2(salida.hh)}:${this.pad2(salida.mm)}`,
                            id_validador: null,
                        }),
                    );
                } else if (u.id_usuario === func7?.id_usuario) {
                    // func7: mixto + un día incompleto (sin salida) cada 5 días
                    const sinSalidaHoy = dayIndex % 5 === 0;

                    rows.push(
                        this.asistenciaRepo.create({
                            id_usuario: u.id_usuario,
                            fecha_hora: this.dateAtBO(diaBO, 10, 30, 0),
                            tipo: 'ENTRADA',
                            estado: 'VALIDA',
                            origen: 'manual',
                            ip_registro: null,
                            observacion: 'Seeder: atraso + mixto',
                            id_validador: null,
                        }),
                    );

                    if (!sinSalidaHoy) {
                        rows.push(
                            this.asistenciaRepo.create({
                                id_usuario: u.id_usuario,
                                fecha_hora: this.dateAtBO(diaBO, 17, 0, 0),
                                tipo: 'SALIDA',
                                estado: 'VALIDA',
                                origen: 'manual',
                                ip_registro: null,
                                observacion: 'Seeder: salida anticipada',
                                id_validador: null,
                            }),
                        );
                    }
                }
            }

            dayIndex += 1;
        }

        await this.asistenciaRepo.save(rows);

        console.log(`✓ Asistencias insertadas: ${rows.length}`);
        console.log('============================================\n');
    }
}