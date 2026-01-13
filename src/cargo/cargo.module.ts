import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cargo } from './entities/cargo.entity';
import { Unidad } from './entities/unidad.entity';
import { CargoMovimiento } from './entities/cargo-movimiento.entity';

import { CargoController } from './controllers/cargo.controller';
import { CargoService } from './services/cargo.service';

import { Usuario } from '../usuario/entities/usuario.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Cargo, Unidad, CargoMovimiento, Usuario])],
    controllers: [CargoController],
    providers: [CargoService],
    exports: [CargoService],
})
export class CargoModule {}