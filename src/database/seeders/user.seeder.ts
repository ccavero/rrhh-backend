import { INestApplicationContext } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario } from '../../usuario/entities/usuario.entity';

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

    const existentes = await this.repo.count();
    if (existentes > 0) {
      console.log('⚠ Ya existen usuarios. No se insertarán nuevos para evitar duplicados.');
      console.log('============================================\n');
      return;
    }

    const passwordHash = bcrypt.hashSync('123456', 10);

    const funcionarios = [
      { nombre: 'Carlos', apellido: 'Funcionario', email: 'func1@agetic.gob.bo' },
      { nombre: 'María', apellido: 'Funcionario', email: 'func2@agetic.gob.bo' },
      { nombre: 'José', apellido: 'Funcionario', email: 'func3@agetic.gob.bo' },
      { nombre: 'Ana', apellido: 'Funcionario', email: 'func4@agetic.gob.bo' },
      { nombre: 'Luis', apellido: 'Funcionario', email: 'func5@agetic.gob.bo' },
      { nombre: 'Sofía', apellido: 'Funcionario', email: 'func6@agetic.gob.bo' },
      { nombre: 'Diego', apellido: 'Funcionario', email: 'func7@agetic.gob.bo' },
    ];

    const usersSeed: Partial<Usuario>[] = [
      {
        nombre: 'Admin',
        apellido: 'Principal',
        email: 'admin@agetic.gob.bo',
        password_hash: passwordHash,
        estado: 'ACTIVO',
        id_rol: 'ADMIN',
      },
      {
        nombre: 'Laura',
        apellido: 'RRHH',
        email: 'rrhh@agetic.gob.bo',
        password_hash: passwordHash,
        estado: 'ACTIVO',
        id_rol: 'RRHH',
      },
      ...funcionarios.map((f) => ({
        ...f,
        password_hash: passwordHash,
        estado: 'ACTIVO',
        id_rol: 'FUNCIONARIO',
      })),
    ];

    await this.repo.save(usersSeed);

    console.log('✓ Usuarios insertados correctamente.');
    console.log('  → Contraseña para todos: 123456');
    console.log('============================================\n');
  }
}