import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

import { UserSeeder } from './seeders/user.seeder';
import { JornadaSeeder } from './seeders/jornada.seeder';
import { PermisoSeeder } from './seeders/permiso.seeder';
import { AsistenciaSeeder } from './seeders/asistencia.seeder';

async function bootstrap() {
  let app;

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
    await new UserSeeder(app).run();
    await new JornadaSeeder(app).run();
    await new PermisoSeeder(app).run();
    await new AsistenciaSeeder(app).run();

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