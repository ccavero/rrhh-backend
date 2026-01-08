import { INestApplicationContext } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Permiso } from '../../permiso/entities/permiso.entity';
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

    // ------------------------------------------
    // EVITAR DUPLICADOS
    // ------------------------------------------
    const existentes = await this.permisoRepo.count();
    if (existentes > 0) {
      console.log(
        '⚠ Ya existen permisos. No se insertarán nuevos para evitar duplicados.',
      );
      console.log('============================================\n');
      return;
    }

    // ------------------------------------------
    // OBTENER FUNCIONARIOS Y RRHH
    // ------------------------------------------
    const funcionarios = await this.usuarioRepo.find({
      where: { id_rol: 'FUNCIONARIO', estado: 'ACTIVO' },
    });

    const rrhh = await this.usuarioRepo.findOne({
      where: { id_rol: 'RRHH', estado: 'ACTIVO' },
    });

    if (funcionarios.length === 0) {
      console.log('⚠ No se encontraron FUNCIONARIOS. Saltando permisos.');
      console.log('============================================\n');
      return;
    }

    console.log(`→ Funcionarios disponibles: ${funcionarios.length}`);
    if (!rrhh) {
      console.log(
        '⚠ No se encontró usuario RRHH. Los permisos aprobados no tendrán resolvedor.',
      );
    }

    // Aseguramos al menos 3 "slots" de funcionarios usando fallback
    const func1 = funcionarios[0];
    const func2 = funcionarios[1] ?? funcionarios[0];
    const func3 = funcionarios[2] ?? funcionarios[0];

    // ------------------------------------------
    // 1) PERMISO APROBADO – func1 – hasta 5 de dic
    // ------------------------------------------
    const permisoAprobado = this.permisoRepo.create({
      id_solicitante: func1.id_usuario,
      tipo: 'VACACION',
      motivo: 'Viaje familiar corto.',
      fecha_inicio: new Date(2025, 11, 3), // 3 de diciembre 2025
      fecha_fin: new Date(2025, 11, 5), // 5 de diciembre 2025
      estado: 'APROBADO',
      id_resolvedor: rrhh?.id_usuario ?? null,
      resuelto_en: new Date(2025, 11, 2, 15, 0, 0), // aprobado el 2 de dic, por ejemplo
    });

    // ------------------------------------------
    // 2) PERMISO PENDIENTE – func2 – para 20 de dic
    // ------------------------------------------
    const permisoPendiente20 = this.permisoRepo.create({
      id_solicitante: func2.id_usuario,
      tipo: 'VACACION',
      motivo: 'Salida por las fiestas de fin de año.',
      fecha_inicio: new Date(2025, 11, 20),
      fecha_fin: new Date(2025, 11, 20),
      estado: 'PENDIENTE',
    });

    // ------------------------------------------
    // 3) PERMISO PENDIENTE – func3 – para 24 de dic
    // ------------------------------------------
    const permisoPendiente24 = this.permisoRepo.create({
      id_solicitante: func3.id_usuario,
      tipo: 'VACACION',
      motivo: 'Noche buena en familia.',
      fecha_inicio: new Date(2025, 11, 24),
      fecha_fin: new Date(2025, 11, 24),
      estado: 'PENDIENTE',
    });

    await this.permisoRepo.save([
      permisoAprobado,
      permisoPendiente20,
      permisoPendiente24,
    ]);

    console.log('✓ Permisos insertados correctamente');
    console.log(`   → Aprobado (hasta 5 dic) para: ${func1.email}`);
    console.log(`   → Pendiente (20 dic) para: ${func2.email}`);
    console.log(`   → Pendiente (24 dic) para: ${func3.email}`);
    console.log('============================================\n');
  }
}
