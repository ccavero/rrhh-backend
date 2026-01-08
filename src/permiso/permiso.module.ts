import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from './entities/permiso.entity';
import { PermisoService } from './services/permiso.service';
import { PermisoController } from './controllers/permiso.controller';
import { Usuario } from '../usuario/entities/usuario.entity';
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Permiso, Usuario])],
  providers: [
    PermisoService,
    {
      provide: 'PermisoRepository',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Permiso),
      inject: [DataSource],
    },
  ],
  exports: ['PermisoRepository'],

  controllers: [PermisoController],
})
export class PermisoModule {}
