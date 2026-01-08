import { IsString, IsNotEmpty, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UsuarioResponseDto } from '../../usuario/dto/usuario.dto';

// ===========================================================
// ENUMS RECOMENDADOS (Opcional pero profesional)
// ===========================================================
export enum TipoPermisoEnum {
  VACACION = 'VACACION',
  ENFERMEDAD = 'ENFERMEDAD',
  ONOMASTICO = 'ONOMASTICO',
  COMISION = 'COMISION',
  GOCE = 'GOCE',
  SIN_GOCE = 'SIN_GOCE',
}

export enum EstadoPermisoEnum {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

// ===========================================================
// DTO: Crear Permiso
// ===========================================================
export class CrearPermisoDto {
  @ApiProperty({
    example: TipoPermisoEnum.VACACION,
    description: 'Tipo de permiso solicitado',
    enum: Object.values(TipoPermisoEnum),
  })
  @IsString()
  @IsIn(Object.values(TipoPermisoEnum))
  tipo: string;

  @ApiProperty({
    example: 'Malestar general y fiebre.',
    description: 'Motivo del permiso',
  })
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @ApiProperty({
    example: '2025-03-01',
    description: 'Fecha de inicio del permiso (ISO8601)',
  })
  @IsDateString()
  fecha_inicio: string;

  @ApiProperty({
    example: '2025-03-03',
    description: 'Fecha final del permiso (ISO8601)',
  })
  @IsDateString()
  fecha_fin: string;
}

// ===========================================================
// DTO: Actualizar Estado del Permiso
// ===========================================================
export class ActualizarEstadoPermisoDto {
  @ApiProperty({
    example: EstadoPermisoEnum.APROBADO,
    description: 'Nuevo estado del permiso',
    enum: Object.values(EstadoPermisoEnum),
  })
  @IsString()
  @IsIn(Object.values(EstadoPermisoEnum))
  estado: string;
}

// ===========================================================
// DTO: Respuesta del permiso
// ===========================================================
export class PermisoResponseDto {
  @ApiProperty({ example: 'fb92b77e-b0e5-4b5d-844e-cbe6201b795a' })
  id_permiso: string;

  @ApiProperty({ enum: Object.values(TipoPermisoEnum) })
  tipo: string;

  @ApiProperty({ example: 'Viaje familiar' })
  motivo: string;

  @ApiProperty({ example: '2025-03-01' })
  fecha_inicio: Date;

  @ApiProperty({ example: '2025-03-05' })
  fecha_fin: Date;

  @ApiProperty({
    enum: Object.values(EstadoPermisoEnum),
    example: EstadoPermisoEnum.PENDIENTE,
  })
  estado: string;

  @ApiProperty({ example: '2025-02-14T10:00:00Z' })
  creado_en: Date;

  @ApiPropertyOptional({ example: '2025-02-15T16:30:00Z' })
  resuelto_en?: Date | null;

  @ApiProperty({
    description: 'Usuario que solicitó el permiso',
    type: UsuarioResponseDto,
  })
  solicitante: UsuarioResponseDto;

  @ApiPropertyOptional({
    description: 'Usuario que resolvió el permiso',
    type: UsuarioResponseDto,
  })
  resolvedor?: UsuarioResponseDto | null;
}
