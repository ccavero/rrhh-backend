// src/cargo/entities/cargo-movimiento.entity.ts
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';
import { Cargo } from './cargo.entity';
import { Unidad } from './unidad.entity';

export type TipoMovimientoCargo = 'INICIAL' | 'ASCENSO' | 'REASIGNACION' | 'BAJA';

@Entity({ name: 'cargo_movimiento' })
@Index(['id_usuario', 'fecha_fin'])
export class CargoMovimiento {
    @PrimaryGeneratedColumn('uuid')
    id_movimiento: string;

    @Column({ type: 'uuid' })
    id_usuario: string;

    @ManyToOne(() => Usuario, (u) => u.movimientos_cargo, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @Column({ type: 'varchar', length: 20 })
    tipo: TipoMovimientoCargo;

    @Column({ type: 'uuid', nullable: true })
    id_cargo: string | null;

    @ManyToOne(() => Cargo, (c) => c.movimientos, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_cargo' })
    cargo: Cargo | null;

    @Column({ type: 'uuid', nullable: true })
    id_unidad: string | null;

    @ManyToOne(() => Unidad, (u) => u.movimientos, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_unidad' })
    unidad: Unidad | null;

    @Column({ type: 'date' })
    fecha_inicio: string;

    @Column({ type: 'date', nullable: true })
    fecha_fin: string | null;

    @Column({ type: 'text', nullable: true })
    observacion: string | null;

    @Column({ type: 'uuid' })
    creado_por: string;

    @ManyToOne(() => Usuario, (u) => u.movimientos_cargo_creados, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'creado_por' })
    creadoPorUsuario: Usuario | null;

    @CreateDateColumn({ type: 'timestamptz' })
    creado_en: Date;
}