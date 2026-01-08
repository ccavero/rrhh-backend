import { INestApplicationContext } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import * as bcrypt from 'bcrypt';

export class UserSeeder {
  private repo: Repository<Usuario>;

  constructor(app: INestApplicationContext) {
    const dataSource = app.get(DataSource);
    this.repo = dataSource.getRepository(Usuario);
  }

  async run() {
    console.log('============================================');
    console.log(' 🧩 INICIANDO SEEDER DE USUARIOS');
    console.log('============================================');

    // ------------------------------------------
    // HASH DE CONTRASEÑA (común a todos)
    // ------------------------------------------
    const passwordHash = bcrypt.hashSync('123456', 10);

    // ------------------------------------------
    // USUARIOS BASE
    // ------------------------------------------
    const usersSeed: Partial<Usuario>[] = [
      // ADMIN
      {
        nombre: 'Admin',
        apellido: 'Principal',
        email: 'admin@agetic.gob.bo',
        password_hash: passwordHash,
        estado: 'ACTIVO',
        id_rol: 'ADMIN',
      },

      // RRHH
      {
        nombre: 'Laura',
        apellido: 'RRHH',
        email: 'rrhh@agetic.gob.bo',
        password_hash: passwordHash,
        estado: 'ACTIVO',
        id_rol: 'RRHH',
      },
    ];

    // ------------------------------------------
    // GENERAR 5 FUNCIONARIOS
    // ------------------------------------------
    const funcionariosNombres = ['Carlos', 'María', 'José', 'Ana', 'Luis'];

    funcionariosNombres.forEach((nombre, index) => {
      usersSeed.push({
        nombre,
        apellido: 'Funcionario',
        email: `func${index + 1}@agetic.gob.bo`,
        password_hash: passwordHash,
        estado: 'ACTIVO',
        id_rol: 'FUNCIONARIO',
      });
    });

    // ------------------------------------------
    // EVITAR DUPLICADOS
    // ------------------------------------------
    const count = await this.repo.count();
    if (count > 0) {
      console.log('⚠ Usuarios ya existen en la base de datos.');
      console.log('   → No se realizará inserción para evitar duplicados.');
      console.log('============================================\n');
      return;
    }

    console.log('→ Insertando usuarios predeterminados...');

    try {
      await this.repo.save(usersSeed);

      console.log('✓ Usuarios insertados correctamente.');
      console.log('--------------------------------------------');
      console.log('  Inicia sesión con cualquiera de estos usuarios:');
      console.log('    • admin@agetic.gob.bo        (ADMIN)');
      console.log('    • rrhh@agetic.gob.bo         (RRHH)');
      console.log('    • func1@agetic.gob.bo        (FUNCIONARIO)');
      console.log('    • func2@agetic.gob.bo        (FUNCIONARIO)');
      console.log('    • func3@agetic.gob.bo        (FUNCIONARIO)');
      console.log('    • func4@agetic.gob.bo        (FUNCIONARIO)');
      console.log('    • func5@agetic.gob.gob       (FUNCIONARIO)');
      console.log('  → Contraseña para todos: 123456');
      console.log('============================================\n');
    } catch (error) {
      console.error('❌ Error insertando usuarios:', error.message);
      console.error(error);
      console.log('============================================\n');
    }
  }
}
