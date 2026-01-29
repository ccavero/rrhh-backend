import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity({ name: 'audit_log' })
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id_audit!: string;

    // actor
    @Index()
    @Column({ type: 'uuid', nullable: true })
    actor_id_usuario!: string | null;

    @Column({ type: 'varchar', length: 40, nullable: true })
    actor_rol!: string | null;

    @Column({ type: 'varchar', length: 120, nullable: true })
    actor_nombre!: string | null;

    // acción
    @Index()
    @Column({ type: 'varchar', length: 80 })
    accion!: string;

    // request
    @Column({ type: 'varchar', length: 10 })
    metodo!: string;

    @Column({ type: 'varchar', length: 200 })
    ruta!: string;

    @Column({ type: 'int', nullable: true })
    status_code!: number | null;

    @Column({ type: 'varchar', length: 20, default: 'OK' })
    resultado!: 'OK' | 'ERROR';

    // target (opcional)
    @Index()
    @Column({ type: 'varchar', length: 50, nullable: true })
    entidad!: string | null;

    @Index()
    @Column({ type: 'varchar', length: 80, nullable: true })
    entidad_id!: string | null;

    // metadata (opcional)
    @Column({ type: 'jsonb', nullable: true })
    metadata!: any | null;

    @CreateDateColumn({ type: 'timestamptz' })
    creado_en!: Date;
}