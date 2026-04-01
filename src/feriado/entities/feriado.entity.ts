import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

export enum TipoFeriado {
    NACIONAL = 'NACIONAL',
    DEPARTAMENTAL = 'DEPARTAMENTAL',
    INSTITUCIONAL = 'INSTITUCIONAL',
    OTRO = 'OTRO',
}

@Entity('feriado')
@Index(['fecha'])
@Index(['activo'])
export class Feriado {
    @PrimaryGeneratedColumn('uuid')
    id_feriado: string;

    @Column({ type: 'date' })
    fecha: string;

    @Column({ type: 'varchar', length: 120 })
    nombre: string;

    @Column({
        type: 'enum',
        enum: TipoFeriado,
        default: TipoFeriado.NACIONAL,
    })
    tipo: TipoFeriado;

    @Column({ type: 'varchar', length: 255, nullable: true })
    descripcion: string | null;

    @Column({ type: 'boolean', default: true })
    activo: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    creado_en: Date;
}