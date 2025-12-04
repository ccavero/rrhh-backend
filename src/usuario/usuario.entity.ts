import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id_usuario: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ length: 120, unique: true })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ length: 20, default: 'ACTIVO' })
  estado: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  creado_en: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualizado_en: Date;

  @Column()
  id_rol: number;
}
