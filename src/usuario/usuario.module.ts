import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { UsuarioService } from './services/usuario.service';
import { UsuarioController } from './controllers/usuario.controller';
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [
    UsuarioService,
    {
      provide: 'UsuarioRepository',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Usuario),
      inject: [DataSource],
    },
  ],
  exports: ['UsuarioRepository'],
  controllers: [UsuarioController],
})
export class UsuarioModule {}
