// src/tarea/tarea.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tarea } from './entities/tarea.entity';
import { TareaController } from './controllers/tarea.controller';
import { TareaService } from './services/tarea.service';
import { Usuario } from '../usuario/entities/usuario.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tarea, Usuario])],
    controllers: [TareaController],
    providers: [TareaService],
})
export class TareaModule {}