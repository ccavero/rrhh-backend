import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('asistencia')
export class Asistencia {
  @PrimaryGeneratedColumn('uuid')
  id_asistencia: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  fecha_hora: Date;

  @Column({ length: 20 })
  tipo: string; // 'entrada' | 'salida'

  @Column({ length: 20, default: 'VALIDA' })
  estado: string; // 'VALIDA' | 'ANULADA'

  @Column({ length: 50, nullable: true })
  origen?: string; // 'web', 'manual', etc.

  @Column({ length: 50, nullable: true })
  ip_registro?: string;

  @Column()
  id_usuario: string; // UUID del usuario que marca asistencia

  @Column({ nullable: true })
  id_validador?: string; // UUID del admin que valida (para más adelante)
}
