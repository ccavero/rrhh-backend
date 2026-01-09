import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './entities/usuario.entity';
import { JornadaLaboral } from './entities/jornada-laboral.entity';
import { UsuarioService } from './services/usuario.service';
import { UsuarioController } from './controllers/usuario.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, JornadaLaboral]),
  ],
  controllers: [
    UsuarioController,
  ],
  providers: [
    UsuarioService,
  ],
  exports: [
    UsuarioService,
  ],
})
export class UsuarioModule {}