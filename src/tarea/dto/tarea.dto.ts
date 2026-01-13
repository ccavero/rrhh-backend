// src/tarea/dto/tarea.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'CUMPLIDA'] as const;

export class CrearTareaDto {
    @ApiProperty({ example: 'Actualizar legajo' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(140)
    titulo: string;

    @ApiPropertyOptional({
        example: 'Revisar documentación y completar datos faltantes.',
    })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiProperty({ example: 'uuid-funcionario', description: 'Usuario asignado' })
    @IsUUID()
    id_asignado_a: string;

    @ApiPropertyOptional({ example: '2026-01-31' })
    @IsOptional()
    @IsDateString()
    fecha_limite?: string;
}

export class CambiarEstadoTareaDto {
    @ApiProperty({ enum: ESTADOS, example: 'EN_PROCESO' })
    @IsString()
    @IsIn(ESTADOS)
    estado: (typeof ESTADOS)[number];
}

export class ActualizarTareaDto {
    @ApiPropertyOptional({ example: 'Actualizar legajo (2da revisión)' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(140)
    titulo?: string;

    @ApiPropertyOptional({
        example: 'Añadir documentación faltante y verificar datos.',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    descripcion?: string | null;

    @ApiPropertyOptional({
        example: '2026-02-10',
        nullable: true,
        description: 'Fecha límite (YYYY-MM-DD) o null para limpiar',
    })
    @IsOptional()
    @IsDateString()
    fecha_limite?: string | null;

    @ApiPropertyOptional({
        example: 'uuid-usuario',
        description: 'Reasignar tarea a otro usuario (opcional)',
    })
    @IsOptional()
    @IsUUID()
    id_asignado_a?: string;
}