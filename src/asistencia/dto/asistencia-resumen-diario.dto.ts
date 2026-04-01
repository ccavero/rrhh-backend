import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AsistenciaResumenDiarioDto {
  @ApiProperty({ example: '2025-12-01', description: 'Fecha (YYYY-MM-DD)' })
  fecha: string;

  @ApiProperty({ example: '08:30', description: 'Hora de entrada' })
  horaEntrada: string;

  @ApiProperty({ example: '17:30', description: 'Hora de salida' })
  horaSalida: string;

  @ApiProperty({ example: 480, description: 'Minutos trabajados en el día' })
  minutosTrabajados: number;

  @ApiProperty({
    example: 480,
    description: 'Minutos objetivo según jornada del usuario (si existe)',
  })
  minutosObjetivo: number;

  @ApiProperty({
    example: 'OK',
    description: 'Estado del día',
    enum: ['OK', 'SIN_REGISTRO', 'PERMISO', 'FDS', 'FERIADO', 'INCOMPLETO'],
  })
  estado: 'OK' | 'SIN_REGISTRO' | 'PERMISO' | 'FDS' | 'FERIADO' | 'INCOMPLETO';

  @ApiPropertyOptional({
    example: '08:00',
    description: 'Hora programada de inicio de jornada',
  })
  horaInicioJornada?: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Minutos de tolerancia configurados en la jornada',
  })
  toleranciaMinutos?: number;

  @ApiPropertyOptional({
    example: 25,
    description: 'Minutos de atraso reales del día',
  })
  atrasoMinutos?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el usuario llegó tarde ese día',
  })
  fueAtraso?: boolean;
}