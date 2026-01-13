import { INestApplicationContext } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Cargo } from '../../cargo/entities/cargo.entity';

export class CargoSeeder {
    private repo: Repository<Cargo>;

    constructor(app: INestApplicationContext) {
        const ds = app.get(DataSource);
        this.repo = ds.getRepository(Cargo);
    }

    async run() {
        console.log('============================================');
        console.log(' 🧩 INICIANDO SEEDER DE CARGOS');
        console.log('============================================');

        const existentes = await this.repo.count();
        if (existentes > 0) {
            console.log('⚠ Ya existen cargos. No se insertarán nuevos para evitar duplicados.');
            console.log('============================================\n');
            return;
        }

        const cargos: Partial<Cargo>[] = [
            { codigo: 'CARGO-001', nombre: 'Cargo 1', activo: true },
            { codigo: 'CARGO-002', nombre: 'Supervisor 1', activo: true },
            { codigo: 'CARGO-003', nombre: 'Analista 1', activo: true },
        ];

        await this.repo.save(cargos as any);

        console.log(`✓ Cargos insertados: ${cargos.length}`);
        console.log('============================================\n');
    }
}