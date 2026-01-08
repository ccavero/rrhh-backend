import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AsistenciaService } from '../services/asistencia.service';
import {
  CrearAsistenciaDto,
  ActualizarAsistenciaDto,
  AsistenciaResponseDto,
} from '../dto/asistencia.dto';
import { User } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AsistenciaResumenDiarioDto } from '../dto/asistencia-resumen-diario.dto';

@ApiTags('asistencia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // 👈 Primero JWT, luego Roles
@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  // ================================================================
  // CREAR ASISTENCIA (cualquier usuario autenticado)
  // ================================================================
  @Post()
  @ApiOperation({
    summary: 'Registrar una asistencia (entrada o salida)',
    description:
      'El usuario autenticado registra una marcación. La API fuerza el id_usuario desde el token para evitar fraude.',
  })
  @ApiResponse({
    status: 201,
    description: 'Asistencia registrada exitosamente',
    type: AsistenciaResponseDto,
  })
  crear(
    @Body() dto: CrearAsistenciaDto,
    @User() usuario: any,
  ): Promise<AsistenciaResponseDto> {
    const data = {
      ...dto,
      id_usuario: usuario.id_usuario, // seguridad anti-fraude
    };

    return this.asistenciaService.crear(data);
  }

  // ================================================================
  // LISTAR ASISTENCIAS (ADMIN o RRHH)
  // ================================================================
  @Get()
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({
    summary: 'Listar todas las asistencias (solo ADMIN o RRHH)',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de asistencias obtenido exitosamente',
    type: [AsistenciaResponseDto],
  })
  listar(): Promise<AsistenciaResponseDto[]> {
    return this.asistenciaService.listar();
  }

  // ================================================================
  // LISTAR MIS ASISTENCIAS (cualquier usuario autenticado)
  // ================================================================
  @Get('mias')
  @ApiOperation({
    summary: 'Listar asistencias del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de asistencias del propio usuario',
    type: [AsistenciaResponseDto],
  })
  listarMias(@User() usuario) {
    return this.asistenciaService.listarPorUsuario(usuario.id_usuario);
  }

  // ================================================================
  // ACTUALIZAR ASISTENCIA (VALIDAR, INVALIDAR, ANULAR) – RRHH/ADMIN
  // ================================================================
  @Patch(':id')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({
    summary:
      'Modificar estado de asistencia (VALIDA, INVALIDA o ANULADA). Solo RRHH o ADMIN.',
    description:
      'El validador se infiere automáticamente desde el token del usuario que realiza la acción.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asistencia a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencia actualizada correctamente',
    type: AsistenciaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Asistencia no encontrada',
  })
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarAsistenciaDto,
    @User() usuario: any,
  ): Promise<AsistenciaResponseDto> {
    const data = {
      ...dto,
      id_validador: usuario.id_usuario,
    };

    return this.asistenciaService.actualizar(id, data);
  }

  @Get('mias/resumen-diario')
  @ApiOperation({
    summary: 'Resumen diario de mis asistencias (rango de fechas)',
    description:
      'Devuelve una fila por día con horas de entrada/salida y minutos trabajados. Incluye días sin registro.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen obtenido correctamente',
    type: [AsistenciaResumenDiarioDto],
  })
  resumenDiarioMias(
    @User() usuario,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.asistenciaService.resumenDiarioUsuario(
      usuario.id_usuario,
      from,
      to,
    );
  }
}
