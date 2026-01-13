import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearUnidadDto {
    @ApiProperty({ example: 'Recursos Humanos' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    nombre: string;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}