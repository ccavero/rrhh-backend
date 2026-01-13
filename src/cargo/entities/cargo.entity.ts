import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CargoMovimiento } from './cargo-movimiento.entity';

@Entity({ name: 'cargo' })
export class Cargo {
    @PrimaryGeneratedColumn('uuid')
    id_cargo: string;

    @Column({ type: 'varchar', length: 30, nullable: true, unique: true })
    codigo: string | null;

    @Column({ type: 'varchar', length: 120 })
    nombre: string;

    @Column({ type: 'boolean', default: true })
    activo: boolean;

    @OneToMany(() => CargoMovimiento, (m) => m.cargo)
    movimientos: CargoMovimiento[];
}