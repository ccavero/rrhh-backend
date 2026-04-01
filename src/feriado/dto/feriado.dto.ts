import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { TipoFeriado } from '../entities/feriado.entity';

export class CrearFeriadoDto {
    @ApiProperty({
        example: '2026-08-06',
        description: 'Fecha del feriado en formato YYYY-MM-DD',
    })
    @IsDateString()
    fecha: string;

    @ApiProperty({
        example: 'Día de la Independencia',
        description: 'Nombre del feriado',
    })
    @IsString()
    @Length(2, 120)
    nombre: string;

    @ApiPropertyOptional({
        enum: TipoFeriado,
        example: TipoFeriado.NACIONAL,
        description: 'Tipo o ámbito del feriado',
    })
    @IsOptional()
    @IsEnum(TipoFeriado)
    tipo?: TipoFeriado;

    @ApiPropertyOptional({
        example: 'Feriado nacional en Bolivia',
        description: 'Descripción adicional',
    })
    @IsOptional()
    @IsString()
    @Length(0, 255)
    descripcion?: string;

    @ApiPropertyOptional({
        example: true,
        description: 'Indica si el feriado está activo',
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}

export class ActualizarFeriadoDto extends PartialType(CrearFeriadoDto) {}

export class FeriadoResponseDto {
    @ApiProperty({ example: 'd0e8f2a0-9f9a-4c5d-ae66-94d3b6e1c001' })
    id_feriado: string;

    @ApiProperty({ example: '2026-08-06' })
    fecha: string;

    @ApiProperty({ example: 'Día de la Independencia' })
    nombre: string;

    @ApiProperty({ enum: TipoFeriado, example: TipoFeriado.NACIONAL })
    tipo: TipoFeriado;

    @ApiPropertyOptional({ example: 'Feriado nacional en Bolivia' })
    descripcion?: string | null;

    @ApiProperty({ example: true })
    activo: boolean;

    @ApiProperty({ example: '2026-03-31T22:00:00.000Z' })
    creado_en: Date;
}