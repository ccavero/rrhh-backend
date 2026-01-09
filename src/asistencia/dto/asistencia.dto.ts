import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UsuarioResponseDto } from '../../usuario/dto/usuario.dto';

const TIPOS = ['ENTRADA', 'SALIDA'] as const;
const ORIGENES = ['web', 'manual', 'app'] as const;
const ESTADOS = ['VALIDA', 'INVALIDA', 'ANULADA'] as const;

export class MarcarAsistenciaDto {
  @ApiProperty({
    example: 'ENTRADA',
    enum: TIPOS,
    description: 'Tipo de marcación',
  })
  @IsString()
  @IsIn(TIPOS)
  tipo: (typeof TIPOS)[number];

  @ApiPropertyOptional({
    example: 'web',
    enum: ORIGENES,
    description: 'Origen del registro',
    default: 'web',
  })
  @IsOptional()
  @IsString()
  @IsIn(ORIGENES)
  origen?: (typeof ORIGENES)[number];
}

export class CrearAsistenciaManualDto {
  @ApiProperty({
    example: 'f4a1db83-5717-4ac3-afaf-1b1c40c4e3b7',
    description: 'ID del usuario al que se le crea la asistencia manual',
  })
  @IsUUID('all')
  @IsNotEmpty()
  id_usuario: string;

  @ApiProperty({ example: 'ENTRADA', enum: TIPOS })
  @IsString()
  @IsIn(TIPOS)
  tipo: (typeof TIPOS)[number];

  @ApiPropertyOptional({
    example: 'manual',
    enum: ORIGENES,
    default: 'manual',
  })
  @IsOptional()
  @IsString()
  @IsIn(ORIGENES)
  origen?: (typeof ORIGENES)[number];

  @ApiPropertyOptional({
    example: 'Corrección por olvido de marcación.',
    description: 'Observación para auditoría',
  })
  @IsOptional()
  @IsString()
  observacion?: string;

  @ApiPropertyOptional({
    example: '2025-12-01T08:30:00.000Z',
    description:
        'Fecha/hora exacta que se quiere registrar. Si no se manda, se usa "ahora".',
  })
  @IsOptional()
  @IsString()
  fecha_hora?: string;
}

export class AnularAsistenciaDto {
  @ApiPropertyOptional({
    example: 'ANULADA',
    enum: ESTADOS,
    description: 'Estado a aplicar (normalmente ANULADA)',
  })
  @IsOptional()
  @IsString()
  @IsIn(ESTADOS)
  estado?: (typeof ESTADOS)[number];

  @ApiPropertyOptional({
    example: 'Anulación por duplicidad.',
    description: 'Motivo/observación',
  })
  @IsOptional()
  @IsString()
  observacion?: string;
}

export class AsistenciaResponseDto {
  @ApiProperty({ example: '9f51457b-1d9a-4633-bcd3-abc12345abcd' })
  id_asistencia: string;

  @ApiProperty({ example: '2025-02-15T08:00:00.000Z' })
  fecha_hora: Date;

  @ApiProperty({ example: 'ENTRADA', enum: TIPOS })
  tipo: string;

  @ApiProperty({ example: 'VALIDA', enum: ESTADOS })
  estado: string;

  @ApiProperty({ example: 'web', enum: ORIGENES })
  origen: string;

  @ApiPropertyOptional({ example: '192.168.1.15' })
  ip_registro: string | null;

  @ApiPropertyOptional({
    example: 'Seeder: entrada / Corrección manual / etc.',
  })
  observacion?: string | null;

  @ApiProperty({ example: 'f4a1db83-5717-4ac3-afaf-1b1c40c4e3b7' })
  id_usuario: string;

  @ApiPropertyOptional({
    example: 'c9b2aaae-2149-4cb3-855a-90d12f71981b',
  })
  id_validador?: string | null;

  @ApiPropertyOptional({ type: UsuarioResponseDto })
  usuario?: UsuarioResponseDto;

  @ApiPropertyOptional({ type: UsuarioResponseDto })
  validador?: UsuarioResponseDto | null;
}