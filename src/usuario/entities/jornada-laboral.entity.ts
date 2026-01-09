import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;
// 1=Lunes ... 7=Domingo

@Entity('jornada_laboral')
@Index('idx_jornada_usuario_dia', ['id_usuario', 'dia_semana'], { unique: true })
export class JornadaLaboral {
    @PrimaryGeneratedColumn('uuid')
    id_jornada: string;

    @Column({ type: 'uuid' })
    id_usuario: string;

    @ManyToOne(() => Usuario, (u) => u.jornadas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @Column({ type: 'smallint' })
    dia_semana: DiaSemana; // 1..7

    // Hora de inicio y fin esperadas para ese día
    @Column({ type: 'time' })
    hora_inicio: string; // "08:30:00"

    @Column({ type: 'time' })
    hora_fin: string; // "16:30:00"

    // Minutos que se espera trabajar ese día (por si hay almuerzo u otros ajustes)
    @Column({ type: 'int' })
    minutos_objetivo: number; // ej 480

    @Column({ type: 'boolean', default: true })
    activo: boolean;

    // opcional: tolerancia por día
    @Column({ type: 'int', default: 0 })
    tolerancia_minutos: number;

    @CreateDateColumn({ type: 'timestamptz' })
    creado_en: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    actualizado_en: Date;
}