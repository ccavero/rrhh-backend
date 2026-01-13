import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

const TIPOS = ['INICIAL', 'ASCENSO', 'REASIGNACION', 'BAJA'] as const;

export class RegistrarMovimientoCargoDto {
    @ApiProperty({ enum: TIPOS, example: 'ASCENSO' })
    @IsString()
    @IsIn(TIPOS)
    tipo: (typeof TIPOS)[number];

    @ApiPropertyOptional({ example: 'uuid-cargo', description: 'Requerido excepto BAJA' })
    @IsUUID()
    @IsOptional()
    id_cargo?: string;

    @ApiPropertyOptional({ example: 'uuid-unidad', description: 'Requerido excepto BAJA' })
    @IsUUID()
    @IsOptional()
    id_unidad?: string;

    @ApiProperty({ example: '2026-01-10', description: 'Fecha inicio del nuevo estado' })
    @IsDateString()
    fecha_inicio: string;

    @ApiPropertyOptional({ example: 'Motivo / nota' })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    observacion?: string;
}