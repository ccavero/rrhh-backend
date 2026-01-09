import { INestApplicationContext } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Permiso, EstadoPermiso, TipoPermiso } from '../../permiso/entities/permiso.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

export class PermisoSeeder {
  private permisoRepo: Repository<Permiso>;
  private usuarioRepo: Repository<Usuario>;

  constructor(app: INestApplicationContext) {
    const dataSource = app.get(DataSource);
    this.permisoRepo = dataSource.getRepository(Permiso);
    this.usuarioRepo = dataSource.getRepository(Usuario);
  }

  async run() {
    console.log('============================================');
    console.log(' 📝 INICIANDO SEEDER DE PERMISOS');
    console.log('============================================');

    const existentes = await this.permisoRepo.count();
    if (existentes > 0) {
      console.log('⚠ Ya existen permisos. No se insertarán nuevos para evitar duplicados.');
      console.log('============================================\n');
      return;
    }

    const funcionarios = await this.usuarioRepo.find({
      where: { id_rol: 'FUNCIONARIO', estado: 'ACTIVO' } as any,
      order: { creado_en: 'ASC' as any },
    });

    const rrhh = await this.usuarioRepo.findOne({
      where: { id_rol: 'RRHH', estado: 'ACTIVO' } as any,
    });

    if (!funcionarios.length) {
      console.log('⚠ No hay FUNCIONARIOS activos. Saltando permisos.');
      console.log('============================================\n');
      return;
    }

    // func1..func7
    const [func1, func2, func3, func4, func5] = [
      funcionarios[0],
      funcionarios[1] ?? funcionarios[0],
      funcionarios[2] ?? funcionarios[0],
      funcionarios[3] ?? funcionarios[0],
      funcionarios[4] ?? funcionarios[0],
    ];

    const d = (ymd: string) => new Date(ymd);

    const permisos: Partial<Permiso>[] = [
      // 2 APROBADOS YA PASARON
      {
        id_solicitante: func1.id_usuario,
        tipo: TipoPermiso.VACACION,
        motivo: 'Vacación corta (ya pasó).',
        fecha_inicio: d('2025-12-23'),
        fecha_fin: d('2025-12-24'),
        estado: EstadoPermiso.APROBADO,
        con_goce: true,
        observacion_resolucion: 'Aprobado con goce (seed)',
        id_resolvedor: rrhh?.id_usuario ?? null,
        resuelto_en: new Date('2025-12-20T15:00:00.000Z'),
      },
      {
        id_solicitante: func2.id_usuario,
        tipo: TipoPermiso.SALUD,
        motivo: 'Reposo médico (ya pasó).',
        fecha_inicio: d('2026-01-02'),
        fecha_fin: d('2026-01-03'),
        estado: EstadoPermiso.APROBADO,
        con_goce: false,
        observacion_resolucion: 'Aprobado sin goce (seed)',
        id_resolvedor: rrhh?.id_usuario ?? null,
        resuelto_en: new Date('2026-01-01T18:00:00.000Z'),
      },

      // 2 PENDIENTES FUTUROS
      {
        id_solicitante: func3.id_usuario,
        tipo: TipoPermiso.PERSONAL,
        motivo: 'Trámite personal (pendiente).',
        fecha_inicio: d('2026-01-20'),
        fecha_fin: d('2026-01-20'),
        estado: EstadoPermiso.PENDIENTE,
        con_goce: false,
        observacion_resolucion: null,
        id_resolvedor: null,
        resuelto_en: null,
      },
      {
        id_solicitante: func4.id_usuario,
        tipo: TipoPermiso.OTRO,
        motivo: 'Viaje programado (pendiente).',
        fecha_inicio: d('2026-02-05'),
        fecha_fin: d('2026-02-06'),
        estado: EstadoPermiso.PENDIENTE,
        con_goce: false,
        observacion_resolucion: null,
        id_resolvedor: null,
        resuelto_en: null,
      },

      // 1 RECHAZADO
      {
        id_solicitante: func5.id_usuario,
        tipo: TipoPermiso.VACACION,
        motivo: 'Solicitud no autorizada (rechazado).',
        fecha_inicio: d('2026-01-06'),
        fecha_fin: d('2026-01-06'),
        estado: EstadoPermiso.RECHAZADO,
        con_goce: false,
        observacion_resolucion: 'Rechazado por falta de respaldo (seed)',
        id_resolvedor: rrhh?.id_usuario ?? null,
        resuelto_en: new Date('2026-01-05T17:00:00.000Z'),
      },
    ];

    await this.permisoRepo.save(permisos as any);

    console.log('✓ Permisos insertados correctamente');
    console.log('============================================\n');
  }
}