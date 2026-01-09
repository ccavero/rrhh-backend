import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';

const DIAS = [1, 2, 3, 4, 5, 6, 7] as const;

export class JornadaDiaDto {
    @ApiProperty({
        example: 1,
        description: 'Día de semana: 1=Lunes ... 7=Domingo',
        enum: DIAS,
    })
    @IsInt()
    @IsIn(DIAS)
    dia_semana: number;

    @ApiProperty({
        example: '08:30:00',
        description: 'Hora de inicio (HH:mm:ss)',
    })
    @IsString()
    hora_inicio: string;

    @ApiProperty({
        example: '16:30:00',
        description: 'Hora de fin (HH:mm:ss)',
    })
    @IsString()
    hora_fin: string;

    @ApiProperty({
        example: 480,
        description: 'Minutos objetivo del día (ej. 480 = 8h)',
    })
    @IsInt()
    @Min(0)
    @Max(1440)
    minutos_objetivo: number;

    @ApiPropertyOptional({
        example: true,
        description: 'Si el día es laborable/activo',
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    activo?: boolean;

    @ApiPropertyOptional({
        example: 10,
        description: 'Tolerancia en minutos (puntualidad)',
        default: 0,
    })
    @IsInt()
    @Min(0)
    @Max(240)
    @IsOptional()
    tolerancia_minutos?: number;
}

export class SetJornadaSemanalDto {
    @ApiProperty({
        description:
            'Lista de jornadas por día. Normalmente 5 registros (L–V), pero puede incluir sábados/domingos.',
        type: JornadaDiaDto,
        isArray: true,
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => JornadaDiaDto)
    dias: JornadaDiaDto[];
}