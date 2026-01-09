import { INestApplicationContext } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';
import { JornadaLaboral } from '../../usuario/entities/jornada-laboral.entity';

export class JornadaSeeder {
    private usuarioRepo: Repository<Usuario>;
    private jornadaRepo: Repository<JornadaLaboral>;

    constructor(app: INestApplicationContext) {
        const dataSource = app.get(DataSource);
        this.usuarioRepo = dataSource.getRepository(Usuario);
        this.jornadaRepo = dataSource.getRepository(JornadaLaboral);
    }

    async run() {
        console.log('============================================');
        console.log(' 🕒 INICIANDO SEEDER DE JORNADAS LABORALES');
        console.log('============================================');

        const existentes = await this.jornadaRepo.count();
        if (existentes > 0) {
            console.log('⚠ Ya existen jornadas. No se insertarán nuevas para evitar duplicados.');
            console.log('============================================\n');
            return;
        }

        const usuarios = await this.usuarioRepo.find({
            where: { estado: 'ACTIVO' as any } as any,
            order: { creado_en: 'ASC' as any },
        });

        if (!usuarios.length) {
            console.log('⚠ No hay usuarios activos. Saltando jornadas.');
            console.log('============================================\n');
            return;
        }

        const diasLaborales = [1, 2, 3, 4, 5]; // L-V

        const rows: Partial<JornadaLaboral>[] = [];
        for (const u of usuarios) {
            for (const dia of diasLaborales) {
                rows.push({
                    id_usuario: u.id_usuario,
                    dia_semana: dia as any,
                    hora_inicio: '10:00:00',
                    hora_fin: '18:00:00',
                    minutos_objetivo: 480,
                    activo: true,
                    tolerancia_minutos: 10,
                });
            }
        }

        await this.jornadaRepo.save(rows as any);

        console.log(`✓ Jornadas insertadas: ${rows.length}`);
        console.log('   → L-V 10:00-18:00 (480 min), tolerancia 10 min');
        console.log('============================================\n');
    }
}