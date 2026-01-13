import { INestApplicationContext } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Unidad } from '../../cargo/entities/unidad.entity';

export class UnidadSeeder {
    private repo: Repository<Unidad>;

    constructor(app: INestApplicationContext) {
        const ds = app.get(DataSource);
        this.repo = ds.getRepository(Unidad);
    }

    async run() {
        console.log('============================================');
        console.log(' 🧩 INICIANDO SEEDER DE UNIDADES');
        console.log('============================================');

        const existentes = await this.repo.count();
        if (existentes > 0) {
            console.log('⚠ Ya existen unidades. No se insertarán nuevas para evitar duplicados.');
            console.log('============================================\n');
            return;
        }

        const unidades: Partial<Unidad>[] = [
            { nombre: 'Unidad 1', activo: true },
            { nombre: 'Unidad 2', activo: true },
            { nombre: 'Unidad 3', activo: true },
        ];

        await this.repo.save(unidades as any);

        console.log(`✓ Unidades insertadas: ${unidades.length}`);
        console.log('============================================\n');
    }
}