import { INestApplicationContext } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Asistencia } from '../../asistencia/entities/asistencia.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

export class AsistenciaSeeder {
  private asistenciaRepo: Repository<Asistencia>;
  private usuarioRepo: Repository<Usuario>;

  constructor(app: INestApplicationContext) {
    const dataSource = app.get(DataSource);
    this.asistenciaRepo = dataSource.getRepository(Asistencia);
    this.usuarioRepo = dataSource.getRepository(Usuario);
  }

  async run() {
    console.log('============================================');
    console.log(' 🕓 INICIANDO SEEDER DE ASISTENCIAS');
    console.log('============================================');

    // ------------------------------------------
    // EVITAR DUPLICADOS
    // ------------------------------------------
    const existentes = await this.asistenciaRepo.count();
    if (existentes > 0) {
      console.log(
        '⚠ Ya existen asistencias. No se insertarán nuevas para evitar duplicados.',
      );
      console.log('============================================\n');
      return;
    }

    // ------------------------------------------
    // OBTENER FUNCIONARIOS
    // ------------------------------------------
    const funcionarios = await this.usuarioRepo.find({
      where: { id_rol: 'FUNCIONARIO', estado: 'ACTIVO' },
    });

    if (funcionarios.length === 0) {
      console.log('⚠ No se encontraron usuarios con rol FUNCIONARIO.');
      console.log('============================================\n');
      return;
    }

    console.log(`→ Se encontraron ${funcionarios.length} funcionarios.`);

    // ------------------------------------------
    // IDENTIFICAR FUNCIONARIO CON PERMISO APROBADO
    // (el mismo que usamos en PermisoSeeder, por ejemplo func1@agetic.gob.bo)
    // ------------------------------------------
    const funcionarioConPermiso = await this.usuarioRepo.findOne({
      where: { email: 'func1@agetic.gob.bo' },
    });

    if (!funcionarioConPermiso) {
      console.log(
        '⚠ No se encontró func1@agetic.gob.bo para marcar el día con permiso.',
      );
    } else {
      console.log(
        `→ Funcionario con permiso aprobado: ${funcionarioConPermiso.email}`,
      );
    }

    // ------------------------------------------
    // GENERAR ASISTENCIAS DEL 1 AL 11 DE DIC 2025
    // Para cada funcionario: entrada 08:30, salida 17:30
    // EXCEPTO: el funcionario con permiso, el día 5 de diciembre
    // ------------------------------------------
    const registros: Asistencia[] = [];

    for (let dia = 1; dia <= 11; dia++) {
      for (const func of funcionarios) {
        const esFuncionarioConPermiso =
          funcionarioConPermiso &&
          func.id_usuario === funcionarioConPermiso.id_usuario;

        const esDiaConPermiso = dia === 5; // 👈 solo el 5 de diciembre
        // Si quieres que no venga del 3 al 5:
        // const esDiaConPermiso = dia >= 3 && dia <= 5;

        if (esFuncionarioConPermiso && esDiaConPermiso) {
          // No generamos asistencia este día para este funcionario
          continue;
        }

        const fechaEntrada = new Date(2025, 11, dia, 8, 30, 0); // 11 = diciembre
        const fechaSalida = new Date(2025, 11, dia, 17, 30, 0);

        const entrada = this.asistenciaRepo.create({
          id_usuario: func.id_usuario,
          tipo: 'entrada',
          fecha_hora: fechaEntrada,
          estado: 'VALIDA',
          origen: 'web',
          ip_registro: '127.0.0.1',
        });

        const salida = this.asistenciaRepo.create({
          id_usuario: func.id_usuario,
          tipo: 'salida',
          fecha_hora: fechaSalida,
          estado: 'VALIDA',
          origen: 'web',
          ip_registro: '127.0.0.1',
        });

        registros.push(entrada, salida);
      }
    }

    await this.asistenciaRepo.save(registros);

    console.log('✓ Asistencias insertadas correctamente');
    console.log(`   → Días generados: 1 al 11 de diciembre de 2025`);
    console.log(`   → Funcionarios: ${funcionarios.length}`);
    console.log(`   → Registros creados: ${registros.length}`);
    if (funcionarioConPermiso) {
      console.log(
        `   → El ${new Date(2025, 11, 5).toDateString()} no se generó asistencia para ${funcionarioConPermiso.email} (permiso aprobado).`,
      );
    }
    console.log('============================================\n');
  }
}
