import { ApiProperty } from '@nestjs/swagger';

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
    enum: ['OK', 'SIN_REGISTRO', 'PERMISO', 'FDS', 'INCOMPLETO'],
  })
  estado: 'OK' | 'SIN_REGISTRO' | 'PERMISO' | 'FDS' | 'INCOMPLETO';
}