// src/usuario/dto/usuario.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsIn,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SetJornadaSemanalDto } from './jornada.dto';

const ROLES = ['ADMIN', 'FUNCIONARIO', 'RRHH'] as const;
const ESTADOS = ['ACTIVO', 'INACTIVO'] as const;

export class CrearUsuarioDto {
  @ApiProperty({ example: 'Carlos', description: 'Nombre del usuario' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Cavero', description: 'Apellido del usuario' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({
    example: 'carlos@agetic.gob.bo',
    description: 'Correo electrónico único del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678',
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'RRHH', description: 'Rol asignado', enum: ROLES })
  @IsString()
  @IsIn(ROLES)
  id_rol: string;

  @ApiPropertyOptional({ example: 'ACTIVO', description: 'Estado', enum: ESTADOS })
  @IsString()
  @IsIn(ESTADOS)
  @IsOptional()
  estado?: string;
}

export class CrearUsuarioConJornadaDto extends CrearUsuarioDto {
  @ApiProperty({
    description: 'Jornada semanal del usuario',
    type: SetJornadaSemanalDto,
  })
  @ValidateNested()
  @Type(() => SetJornadaSemanalDto)
  jornada: SetJornadaSemanalDto;
}

export class ActualizarUsuarioDto {
  @ApiPropertyOptional({ example: 'Carlos', description: 'Nombre del usuario' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Cavero', description: 'Apellido del usuario' })
  @IsString()
  @IsOptional()
  apellido?: string;

  @ApiPropertyOptional({
    example: 'carlos@agetic.gob.bo',
    description: 'Nuevo correo del usuario',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'nuevoPassword123',
    description: 'Contraseña nueva del usuario (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'ADMIN', description: 'Nuevo rol', enum: ROLES })
  @IsString()
  @IsIn(ROLES)
  @IsOptional()
  id_rol?: string;

  @ApiPropertyOptional({ example: 'ACTIVO', description: 'Estado', enum: ESTADOS })
  @IsString()
  @IsIn(ESTADOS)
  @IsOptional()
  estado?: string;
}

export class UsuarioResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identificador único del usuario',
  })
  id_usuario: string;

  @ApiProperty({ example: 'Carlos', description: 'Nombre del usuario' })
  nombre: string;

  @ApiProperty({ example: 'Cavero', description: 'Apellido del usuario' })
  apellido: string;

  @ApiProperty({ example: 'carlos@agetic.gob.bo', description: 'Correo electrónico' })
  email: string;

  @ApiProperty({ example: 'RRHH', description: 'Rol', enum: ROLES })
  id_rol: string;

  @ApiProperty({ example: 'ACTIVO', description: 'Estado' })
  estado: string;

  @ApiProperty({
    example: '2024-10-18T14:30:00.000Z',
    description: 'Fecha de creación',
  })
  creado_en: Date;

  @ApiProperty({
    example: '2024-10-19T09:12:00.000Z',
    description: 'Última actualización',
  })
  actualizado_en: Date;
}