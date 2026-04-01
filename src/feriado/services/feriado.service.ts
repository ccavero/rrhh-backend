import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Feriado, TipoFeriado } from '../entities/feriado.entity';
import {
    ActualizarFeriadoDto,
    CrearFeriadoDto,
    FeriadoResponseDto,
} from '../dto/feriado.dto';

@Injectable()
export class FeriadoService {
    constructor(
        @InjectRepository(Feriado)
        private readonly feriadoRepo: Repository<Feriado>,
    ) {}

    async listar(): Promise<FeriadoResponseDto[]> {
        const items = await this.feriadoRepo.find({
            order: { fecha: 'ASC' as any },
        });
        return items as unknown as FeriadoResponseDto[];
    }

    async crear(dto: CrearFeriadoDto): Promise<FeriadoResponseDto> {
        const existente = await this.feriadoRepo.findOne({
            where: { fecha: dto.fecha, activo: true } as any,
        });

        if (existente) {
            throw new BadRequestException('Ya existe un feriado activo registrado para esa fecha.');
        }

        const nuevo = this.feriadoRepo.create({
            fecha: dto.fecha,
            nombre: dto.nombre,
            tipo: dto.tipo ?? TipoFeriado.NACIONAL,
            descripcion: dto.descripcion ?? null,
            activo: dto.activo ?? true,
        });

        const guardado = await this.feriadoRepo.save(nuevo);
        return guardado as unknown as FeriadoResponseDto;
    }

    async actualizar(id_feriado: string, dto: ActualizarFeriadoDto): Promise<FeriadoResponseDto> {
        const item = await this.feriadoRepo.findOne({ where: { id_feriado } });
        if (!item) throw new NotFoundException('Feriado no encontrado');

        if (dto.fecha && dto.fecha !== item.fecha) {
            const colision = await this.feriadoRepo.findOne({
                where: { fecha: dto.fecha, activo: true } as any,
            });

            if (colision && colision.id_feriado !== id_feriado) {
                throw new BadRequestException('Ya existe un feriado activo registrado para esa fecha.');
            }
        }

        Object.assign(item, {
            fecha: dto.fecha ?? item.fecha,
            nombre: dto.nombre ?? item.nombre,
            tipo: dto.tipo ?? item.tipo,
            descripcion: dto.descripcion ?? item.descripcion,
            activo: dto.activo ?? item.activo,
        });

        const updated = await this.feriadoRepo.save(item);
        return updated as unknown as FeriadoResponseDto;
    }

    async obtenerActivoEnFecha(fecha: string): Promise<Feriado | null> {
        return this.feriadoRepo.findOne({
            where: { fecha, activo: true } as any,
        });
    }
}