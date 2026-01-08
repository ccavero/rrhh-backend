import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Asistencia } from '../../asistencia/entities/asistencia.entity';
import { Permiso } from '../../permiso/entities/permiso.entity';

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

  @Column({ length: 20 })
  estado: string; // ACTIVO / INACTIVO

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creado_en: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  actualizado_en: Date;

  @Column({ type: 'varchar', length: 20 })
  id_rol: string; // ADMIN, FUNCIONARIO, RRHH

  @OneToMany(() => Asistencia, (a) => a.usuario)
  asistencias: Asistencia[];

  @OneToMany(() => Asistencia, (a) => a.validador)
  asistencias_validadas: Asistencia[];

  @OneToMany(() => Permiso, (p) => p.solicitante)
  permisos_solicitados: Permiso[];

  @OneToMany(() => Permiso, (p) => p.resolvedor)
  permisos_resueltos: Permiso[];
}
