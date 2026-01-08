import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('asistencia')
export class Asistencia {
  @PrimaryGeneratedColumn('uuid')
  id_asistencia: string;

  @Column({ type: 'timestamp' })
  fecha_hora: Date;

  @Column({ length: 20 })
  tipo: string; // 'ENTRADA' | 'SALIDA'

  @Column({ length: 20 })
  estado: string; // 'VALIDA' | 'INVALIDA' | 'ANULADA'

  @Column({ length: 50 })
  origen: string; // 'web' | 'manual' | 'app'

  @Column({ length: 50 })
  ip_registro: string;

  @ManyToOne(() => Usuario, (u) => u.asistencias)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ type: 'uuid' })
  id_usuario: string;

  @ManyToOne(() => Usuario, (u) => u.asistencias_validadas, { nullable: true })
  @JoinColumn({ name: 'id_validador' })
  validador?: Usuario | null;

  @Column({ type: 'uuid', nullable: true })
  id_validador?: string | null;
}
