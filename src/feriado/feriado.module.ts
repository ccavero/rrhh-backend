import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Feriado } from './entities/feriado.entity';
import { FeriadoService } from './services/feriado.service';
import { FeriadoController } from './controllers/feriado.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Feriado])],
    providers: [FeriadoService],
    controllers: [FeriadoController],
    exports: [FeriadoService],
})
export class FeriadoModule {}