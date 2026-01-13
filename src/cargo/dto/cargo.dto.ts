import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearCargoDto {
    @ApiPropertyOptional({ example: 'ANL-01', description: 'Código único (opcional)' })
    @IsString()
    @IsOptional()
    @MaxLength(40)
    codigo?: string;

    @ApiProperty({ example: 'Analista de RRHH' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    nombre: string;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}