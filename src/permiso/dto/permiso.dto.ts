import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsDateString,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UsuarioResponseDto } from '../../usuario/dto/usuario.dto';
import { EstadoPermiso, TipoPermiso } from '../entities/permiso.entity';

export class CrearPermisoDto {
  @ApiProperty({
    example: TipoPermiso.VACACION,
    description: 'Tipo de permiso solicitado',
    enum: Object.values(TipoPermiso),
  })
  @IsString()
  @IsIn(Object.values(TipoPermiso))
  tipo: TipoPermiso;

  @ApiProperty({
    example: 'Viaje familiar.',
    description: 'Motivo del permiso',
  })
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @ApiProperty({
    example: '2025-12-03',
    description: 'Fecha de inicio del permiso (YYYY-MM-DD)',
  })
  @IsDateString()
  fecha_inicio: string;

  @ApiProperty({
    example: '2025-12-05',
    description: 'Fecha final del permiso (YYYY-MM-DD)',
  })
  @IsDateString()
  fecha_fin: string;
}

export class ResolverPermisoDto {
  @ApiProperty({
    example: EstadoPermiso.APROBADO,
    description: 'Nuevo estado del permiso',
    enum: [EstadoPermiso.APROBADO, EstadoPermiso.RECHAZADO],
  })
  @IsString()
  @IsIn([EstadoPermiso.APROBADO, EstadoPermiso.RECHAZADO])
  estado: EstadoPermiso;

  @ApiPropertyOptional({
    example: true,
    description:
        'Si el permiso es con goce (pago). Solo relevante si se APRUEBA.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  con_goce?: boolean;

  @ApiPropertyOptional({
    example: 'Aprobado por RRHH con goce según norma interna.',
    description: 'Observación de la resolución (trazabilidad).',
  })
  @IsString()
  @IsOptional()
  observacion_resolucion?: string;
}

export class PermisoResponseDto {
  @ApiProperty({ example: 'fb92b77e-b0e5-4b5d-844e-cbe6201b795a' })
  id_permiso: string;

  @ApiProperty({ enum: Object.values(TipoPermiso) })
  tipo: TipoPermiso;

  @ApiProperty({ example: 'Viaje familiar' })
  motivo: string;

  @ApiProperty({ example: '2025-12-03' })
  fecha_inicio: Date;

  @ApiProperty({ example: '2025-12-05' })
  fecha_fin: Date;

  @ApiProperty({
    enum: Object.values(EstadoPermiso),
    example: EstadoPermiso.PENDIENTE,
  })
  estado: EstadoPermiso;

  @ApiProperty({ example: false })
  con_goce: boolean;

  @ApiPropertyOptional({ example: 'Aprobado con goce.' })
  observacion_resolucion?: string | null;

  @ApiProperty({ example: '2025-02-14T10:00:00Z' })
  creado_en: Date;

  @ApiPropertyOptional({ example: '2025-02-15T16:30:00Z' })
  resuelto_en?: Date | null;

  @ApiProperty({ type: UsuarioResponseDto })
  solicitante: UsuarioResponseDto;

  @ApiPropertyOptional({ type: UsuarioResponseDto })
  resolvedor?: UsuarioResponseDto | null;
}