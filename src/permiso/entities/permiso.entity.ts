import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
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

  @Column({ length: 30 })
  tipo: string;

  @Column({ type: 'text' })
  motivo: string;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date' })
  fecha_fin: Date;

  @Column({ length: 20 })
  estado: string; // PENDIENTE / APROBADO / RECHAZADO

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creado_en: Date;

  @Column({ type: 'timestamp', nullable: true })
  resuelto_en: Date | null;

  @ManyToOne(() => Usuario, (u) => u.permisos_solicitados)
  @JoinColumn({ name: 'id_solicitante' })
  solicitante: Usuario;

  @Column({ type: 'uuid' })
  id_solicitante: string;

  @ManyToOne(() => Usuario, (u) => u.permisos_resueltos, { nullable: true })
  @JoinColumn({ name: 'id_resolvedor' })
  resolvedor?: Usuario;

  @Column({ type: 'uuid', nullable: true })
  id_resolvedor: string | null;
}
