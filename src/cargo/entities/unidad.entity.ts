import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CargoMovimiento } from './cargo-movimiento.entity';

@Entity({ name: 'unidad' })
export class Unidad {
    @PrimaryGeneratedColumn('uuid')
    id_unidad: string;

    @Column({ type: 'varchar', length: 120, unique: true })
    nombre: string;

    @Column({ type: 'boolean', default: true })
    activo: boolean;

    @OneToMany(() => CargoMovimiento, (m) => m.unidad)
    movimientos: CargoMovimiento[];
}