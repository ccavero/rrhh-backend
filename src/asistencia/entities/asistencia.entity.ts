import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

export type AsistenciaTipo = 'ENTRADA' | 'SALIDA';
export type AsistenciaEstado = 'VALIDA' | 'INVALIDA' | 'ANULADA';
export type AsistenciaOrigen = 'web' | 'manual' | 'app';

@Entity('asistencia')
@Index('idx_asistencia_usuario_fecha', ['id_usuario', 'fecha_hora'])
export class Asistencia {
  @PrimaryGeneratedColumn('uuid')
  id_asistencia: string;

  // Momento real de la marca (inicio/fin). Usamos timestamptz para evitar líos de TZ.
  @Column({ type: 'timestamptz' })
  fecha_hora: Date;

  @Column({ type: 'varchar', length: 20 })
  tipo: AsistenciaTipo; // ENTRADA | SALIDA

  @Column({ type: 'varchar', length: 20, default: 'VALIDA' })
  estado: AsistenciaEstado; // VALIDA | INVALIDA | ANULADA

  @Column({ type: 'varchar', length: 50, default: 'web' })
  origen: AsistenciaOrigen; // web | manual | app

  // IP puede no existir en dev/proxy; mejor nullable para no romper
  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_registro: string | null;

  // Motivo/observación (especialmente para correcciones manuales o anulaciones)
  @Column({ type: 'varchar', length: 255, nullable: true })
  observacion?: string | null;

  @ManyToOne(() => Usuario, (u) => u.asistencias)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ type: 'uuid' })
  id_usuario: string;

  // Quien valida/corrige (RRHH/ADMIN). Nulo en marcas normales del usuario.
  @ManyToOne(() => Usuario, (u) => u.asistencias_validadas, { nullable: true })
  @JoinColumn({ name: 'id_validador' })
  validador?: Usuario | null;

  @Column({ type: 'uuid', nullable: true })
  id_validador?: string | null;

  // Auditoría técnica: cuándo se guardó en el sistema
  @CreateDateColumn({ type: 'timestamptz' })
  creado_en: Date;
}