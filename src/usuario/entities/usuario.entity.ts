// src/usuario/entities/usuario.entity.ts
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

import { CargoMovimiento } from '../../cargo/entities/cargo-movimiento.entity';
import { Tarea } from '../../tarea/entities/tarea.entity';

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

  @Column({ length: 255, select: false })
  password_hash: string;

  @Column({ length: 20, default: 'ACTIVO' })
  estado: string;

  @CreateDateColumn({ type: 'timestamptz' })
  creado_en: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  actualizado_en: Date;

  @Column({ type: 'varchar', length: 20 })
  id_rol: string;

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

  @OneToMany(() => CargoMovimiento, (m) => m.usuario)
  movimientos_cargo: CargoMovimiento[];

  @OneToMany(() => CargoMovimiento, (m) => m.creadoPorUsuario)
  movimientos_cargo_creados: CargoMovimiento[];

  @OneToMany(() => Tarea, (t) => t.asignadoA)
  tareas_asignadas_a: Tarea[];

  @OneToMany(() => Tarea, (t) => t.asignadoPor)
  tareas_asignadas_por: Tarea[];
}