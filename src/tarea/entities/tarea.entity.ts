// src/tarea/entities/tarea.entity.ts
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';

export type EstadoTarea = 'PENDIENTE' | 'EN_PROCESO' | 'CUMPLIDA';

@Entity({ name: 'tarea' })
@Index(['id_asignado_a', 'estado'])
export class Tarea {
    @PrimaryGeneratedColumn('uuid')
    id_tarea: string;

    @Column({ type: 'varchar', length: 140 })
    titulo: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string | null;

    @Column({ type: 'varchar', length: 20 })
    estado: EstadoTarea;

    @Column({ type: 'date', nullable: true })
    fecha_limite: string | null;

    @Column({ type: 'uuid', nullable: true })
    id_asignado_por: string | null;

    @ManyToOne(() => Usuario, (u) => u.tareas_asignadas_por, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'id_asignado_por' })
    asignadoPor: Usuario | null;

    @Column({ type: 'uuid' })
    id_asignado_a: string;

    @ManyToOne(() => Usuario, (u) => u.tareas_asignadas_a, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'id_asignado_a' })
    asignadoA: Usuario;

    @CreateDateColumn({ type: 'timestamptz' })
    creado_en: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    actualizado_en: Date;
}