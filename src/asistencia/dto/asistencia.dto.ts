import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsIn,
  IsIP,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UsuarioResponseDto } from '../../usuario/dto/usuario.dto';

// ======================================================
// DTO PARA CREAR ASISTENCIA
// ======================================================
export class CrearAsistenciaDto {
  @ApiProperty({
    example: 'f4a1db83-5717-4ac3-afaf-1b1c40c4e3b7',
    description: 'ID del usuario que registra la asistencia',
  })
  @IsUUID('all')
  @IsNotEmpty()
  id_usuario: string;

  @ApiProperty({
    example: 'entrada',
    enum: ['entrada', 'salida'],
    description: 'Tipo de marcación realizada',
  })
  @IsString()
  @IsIn(['entrada', 'salida'])
  tipo: string;

  @ApiProperty({
    example: 'web',
    enum: ['web', 'manual', 'app'],
    description: 'Origen del registro de asistencia',
  })
  @IsString()
  @IsIn(['web', 'manual', 'app'])
  origen: string;

  @ApiProperty({
    example: '192.168.1.15',
    description: 'Dirección IP desde la cual se genera el registro',
  })
  @IsIP()
  ip_registro: string;

  @ApiProperty({
    example: '2025-02-15T08:00:00.000Z',
    description: 'Fecha y hora del registro en formato ISO8601',
  })
  @IsDateString()
  fecha_hora: string;
}

// ======================================================
// DTO PARA ACTUALIZAR ASISTENCIA (RRHH / ADMIN)
// ======================================================
export class ActualizarAsistenciaDto {
  @ApiPropertyOptional({
    example: 'INVALIDA',
    enum: ['VALIDA', 'INVALIDA', 'ANULADA'],
    description: 'Nuevo estado de la asistencia',
  })
  @IsOptional()
  @IsString()
  @IsIn(['VALIDA', 'INVALIDA', 'ANULADA'])
  estado?: string;

  @ApiPropertyOptional({
    example: 'c9b2aaae-2149-4cb3-855a-90d12f71981b',
    description: 'ID del validador que modifica la asistencia',
  })
  @IsOptional()
  @IsUUID()
  id_validador?: string;
}

// ======================================================
// DTO PARA RESPUESTA: AsistenciaResponseDto
// ======================================================
export class AsistenciaResponseDto {
  @ApiProperty({
    example: '9f51457b-1d9a-4633-bcd3-abc12345abcd',
    description: 'ID único del registro de asistencia',
  })
  id_asistencia: string;

  @ApiProperty({
    example: '2025-02-15T08:00:00.000Z',
    description: 'Fecha y hora exacta del registro',
  })
  fecha_hora: Date;

  @ApiProperty({
    example: 'entrada',
    enum: ['entrada', 'salida'],
  })
  tipo: string;

  @ApiProperty({
    example: 'VALIDA',
    enum: ['VALIDA', 'INVALIDA', 'ANULADA'],
    description: 'Estado actual del registro de asistencia',
  })
  estado: string;

  @ApiProperty({
    example: 'web',
    enum: ['web', 'manual', 'app'],
  })
  origen: string;

  @ApiProperty({
    example: '192.168.1.15',
    description: 'IP desde donde se generó la asistencia',
  })
  ip_registro: string;

  @ApiProperty({
    example: 'f4a1db83-5717-4ac3-afaf-1b1c40c4e3b7',
  })
  id_usuario: string;

  @ApiProperty({
    description: 'Datos del usuario que realizó la marcación',
    type: UsuarioResponseDto,
  })
  usuario: UsuarioResponseDto;

  @ApiPropertyOptional({
    example: 'c9b2aaae-2149-4cb3-855a-90d12f71981b',
  })
  id_validador?: string | null;

  @ApiPropertyOptional({
    description: 'Datos del validador (si existe)',
    type: UsuarioResponseDto,
  })
  validador?: UsuarioResponseDto | null;
}
