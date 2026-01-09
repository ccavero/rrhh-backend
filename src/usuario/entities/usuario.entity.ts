import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Asistencia } from '../../asistencia/entities/asistencia.entity';
import { Permiso } from '../../permiso/entities/permiso.entity';
import { JornadaLaboral } from './jornada-laboral.entity';

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

  // ⚠ Seguridad: este campo no debe salir en consultas normales
  @Column({ length: 255, select: false })
  password_hash: string;

  @Column({ length: 20, default: 'ACTIVO' })
  estado: string; // ACTIVO / INACTIVO

  @CreateDateColumn({ type: 'timestamptz' })
  creado_en: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  actualizado_en: Date;

  @Column({ type: 'varchar', length: 20 })
  id_rol: string; // ADMIN, FUNCIONARIO, RRHH

  @OneToMany(() => JornadaLaboral, (j) => j.usuario)
  jornadas: JornadaLaboral[];

  @OneToMany(() => Asistencia, (a) => a.usuario)
  asistencias: Asistencia[];

  @OneToMany(() => Asistencia, (a) => a.validador)
  asistencias_validadas: Asistencia[];

  @OneToMany(() => Permiso, (p) => p.solicitante)
  permisos_solicitados: Permiso[];

  @OneToMany(() => Permiso, (p) => p.resolvedor)
  permisos_resueltos: Permiso[];
}