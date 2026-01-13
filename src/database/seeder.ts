// src/database/seeder.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

import { UserSeeder } from './seeders/user.seeder';
import { JornadaSeeder } from './seeders/jornada.seeder';
import { PermisoSeeder } from './seeders/permiso.seeder';
import { AsistenciaSeeder } from './seeders/asistencia.seeder';

import { CargoSeeder } from './seeders/cargo.seeder';
import { UnidadSeeder } from './seeders/unidad.seeder';
import { CargoMovimientoSeeder } from './seeders/cargo-movimiento.seeder';

import { TareaSeeder } from './seeders/tarea.seeder';

async function bootstrap() {
  let app: Awaited<ReturnType<typeof NestFactory.createApplicationContext>> | undefined;

  try {
    app = await NestFactory.createApplicationContext(AppModule);

    console.log('============================================');
    console.log(' 🌱 INICIANDO GENERACIÓN DE DATOS DE PRUEBA');
    console.log('============================================\n');

    // ORDEN:
    // 1) Usuarios
    // 2) Jornadas
    // 3) Permisos
    // 4) Asistencias (depende de permisos para omitir días)
    // 5) Cargos + Unidades
    // 6) Movimientos de cargo (depende de usuarios + cargos + unidades)
    // 7) Tareas (depende de usuarios)
    await new UserSeeder(app).run();
    await new JornadaSeeder(app).run();
    await new PermisoSeeder(app).run();
    await new AsistenciaSeeder(app).run();

    await new CargoSeeder(app).run();
    await new UnidadSeeder(app).run();
    await new CargoMovimientoSeeder(app).run();

    await new TareaSeeder(app).run();

    console.log('============================================');
    console.log(' 🌱 SEED COMPLETADO EXITOSAMENTE');
    console.log('============================================\n');
  } catch (error) {
    console.error('\n❌ ERROR DURANTE EL SEEDING');
    console.error(error);
  } finally {
    if (app) await app.close();
  }
}

void bootstrap();