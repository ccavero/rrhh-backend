import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

export enum EstadoPermiso {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

export enum TipoPermiso {
  VACACION = 'VACACION',
  SALUD = 'SALUD',
  PERSONAL = 'PERSONAL',
  OTRO = 'OTRO',
}

@Index(['estado'])
@Index(['fecha_inicio', 'fecha_fin'])
@Entity('permiso')
export class Permiso {
  @PrimaryGeneratedColumn('uuid')
  id_permiso: string;

  @Column({ type: 'enum', enum: TipoPermiso })
  tipo: TipoPermiso;

  @Column({ type: 'text' })
  motivo: string;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date' })
  fecha_fin: Date;

  @Column({ type: 'enum', enum: EstadoPermiso, default: EstadoPermiso.PENDIENTE })
  estado: EstadoPermiso;

  // ✅ se decide al resolver (RRHH/ADMIN)
  @Column({ type: 'boolean', default: false })
  con_goce: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observacion_resolucion: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  creado_en: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resuelto_en: Date | null;

  @ManyToOne(() => Usuario, (u) => u.permisos_solicitados)
  @JoinColumn({ name: 'id_solicitante' })
  solicitante: Usuario;

  @Column({ type: 'uuid' })
  id_solicitante: string;

  @ManyToOne(() => Usuario, (u) => u.permisos_resueltos, { nullable: true })
  @JoinColumn({ name: 'id_resolvedor' })
  resolvedor?: Usuario | null;

  @Column({ type: 'uuid', nullable: true })
  id_resolvedor: string | null;
}