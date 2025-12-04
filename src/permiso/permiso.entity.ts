import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permiso')
export class Permiso {
  @PrimaryGeneratedColumn('uuid')
  id_permiso: string;

  @Column({ length: 30 })
  tipo: string; // vacación, comisión, etc.

  @Column({ type: 'text', nullable: true })
  motivo?: string;

  @Column({ type: 'date' })
  fecha_inicio: string; // YYYY-MM-DD

  @Column({ type: 'date' })
  fecha_fin: string; // YYYY-MM-DD

  @Column({ length: 20, default: 'PENDIENTE' })
  estado: string; // PENDIENTE | APROBADO | RECHAZADO

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  creado_en: Date;

  @Column({ type: 'timestamp', nullable: true })
  resuelto_en?: Date;

  @Column()
  id_solicitante: string; // UUID

  @Column({ nullable: true })
  id_resolvedor?: string; // UUID del admin que resuelve
}
