import { INestApplicationContext } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';

import { Tarea } from '../../tarea/entities/tarea.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

export class TareaSeeder {
    private tareaRepo: Repository<Tarea>;
    private usuarioRepo: Repository<Usuario>;

    constructor(app: INestApplicationContext) {
        const ds = app.get(DataSource);
        this.tareaRepo = ds.getRepository(Tarea);
        this.usuarioRepo = ds.getRepository(Usuario);
    }

    async run() {
        console.log('============================================');
        console.log(' ✅ INICIANDO SEEDER DE TAREAS');
        console.log('============================================');

        // 1) Cargar usuarios disponibles (reales)
        const responsables = await this.usuarioRepo.find({
            where: [
                { id_rol: 'ADMIN', estado: 'ACTIVO' },
                { id_rol: 'RRHH', estado: 'ACTIVO' },
            ] as any,
            order: { creado_en: 'ASC' as any },
        });

        const funcionarios = await this.usuarioRepo.find({
            where: { id_rol: 'FUNCIONARIO', estado: 'ACTIVO' } as any,
            order: { creado_en: 'ASC' as any },
        });

        if (!responsables.length || !funcionarios.length) {
            console.log('⚠ Faltan responsables (ADMIN/RRHH) o funcionarios. Saltando tareas.');
            console.log('============================================\n');
            return;
        }

        // 2) Si ya hay tareas, validar consistencia contra usuarios actuales
        const existentes = await this.tareaRepo.count();
        if (existentes > 0) {
            const tareas = await this.tareaRepo.find({
                select: ['id_tarea', 'id_asignado_a', 'id_asignado_por'] as any,
                take: 5000, // suficiente para dev; si quieres, paginar
            });

            const idsA = [...new Set(tareas.map((t) => t.id_asignado_a).filter(Boolean))] as string[];
            const idsPor = [...new Set(tareas.map((t) => t.id_asignado_por).filter(Boolean))] as string[];

            const usuariosA = await this.usuarioRepo.find({
                where: { id_usuario: In(idsA) } as any,
                select: ['id_usuario'] as any,
            });
            const usuariosPor = await this.usuarioRepo.find({
                where: { id_usuario: In(idsPor) } as any,
                select: ['id_usuario'] as any,
            });

            const setA = new Set(usuariosA.map((u) => u.id_usuario));
            const setPor = new Set(usuariosPor.map((u) => u.id_usuario));

            const hayHuerfanas = tareas.some(
                (t) => !setA.has(t.id_asignado_a) || (t.id_asignado_por && !setPor.has(t.id_asignado_por)),
            );

            if (!hayHuerfanas) {
                console.log('⚠ Ya existen tareas y son consistentes. No se insertarán nuevas.');
                console.log('============================================\n');
                return;
            }

            console.log('🧹 Detectadas tareas huérfanas (usuarios inexistentes). Limpieza y reseed...');
            await this.tareaRepo.clear(); // TRUNCATE equivalente en TypeORM
        }

        const asignador = responsables[0]!;
        const ymd = (s: string) => s;

        const base: Partial<Tarea>[] = [
            {
                titulo: 'Tarea 1',
                descripcion: 'Seeder: tarea de prueba 1',
                estado: 'PENDIENTE',
                fecha_limite: ymd('2026-01-20'),
                id_asignado_por: asignador.id_usuario,
                id_asignado_a: funcionarios[0]!.id_usuario,
            },
            {
                titulo: 'Tarea 2',
                descripcion: 'Seeder: tarea de prueba 2',
                estado: 'EN_PROCESO',
                fecha_limite: ymd('2026-01-18'),
                id_asignado_por: asignador.id_usuario,
                id_asignado_a: (funcionarios[1] ?? funcionarios[0])!.id_usuario,
            },
            {
                titulo: 'Tarea 3',
                descripcion: 'Seeder: tarea de prueba 3',
                estado: 'CUMPLIDA',
                fecha_limite: ymd('2026-01-10'),
                id_asignado_por: asignador.id_usuario,
                id_asignado_a: (funcionarios[2] ?? funcionarios[0])!.id_usuario,
            },
        ];

        const extras: Partial<Tarea>[] = funcionarios.slice(0, 5).map((u, i) => ({
            titulo: `Tarea ${4 + i}`,
            descripcion: 'Seeder: extra',
            estado: 'PENDIENTE',
            fecha_limite: ymd(`2026-01-${String(21 + i).padStart(2, '0')}`),
            id_asignado_por: asignador.id_usuario,
            id_asignado_a: u.id_usuario,
        }));

        await this.tareaRepo.save([...base, ...extras] as any);

        console.log(`✓ Tareas insertadas: ${base.length + extras.length}`);
        console.log('============================================\n');
    }
}