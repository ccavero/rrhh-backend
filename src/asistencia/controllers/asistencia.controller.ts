import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AsistenciaService } from '../services/asistencia.service';
import {
  MarcarAsistenciaDto,
  CrearAsistenciaManualDto,
  AnularAsistenciaDto,
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
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  // ================================================================
  // MARCAR (cualquier usuario autenticado)
  // ================================================================
  @Post()
  @ApiOperation({ summary: 'Marcar ENTRADA o SALIDA (usuario autenticado)' })
  @ApiResponse({ status: 201, type: AsistenciaResponseDto })
  marcar(
      @User() actor: any,
      @Body() dto: MarcarAsistenciaDto,
      @Req() req: Request,
  ) {
    // ip simple (en proxys reales usarías X-Forwarded-For)
    const ip = (req.ip as string) ?? null;
    return this.asistenciaService.marcar(actor, dto, ip);
  }

  // ================================================================
  // MIS ASISTENCIAS
  // ================================================================
  @Get('mias')
  @ApiOperation({ summary: 'Listar mis asistencias' })
  @ApiResponse({ status: 200, type: [AsistenciaResponseDto] })
  misAsistencias(@User() actor: any) {
    return this.asistenciaService.misAsistencias(actor);
  }

  // ================================================================
  // RESUMEN DIARIO (mío)
  // ================================================================
  @Get('mias/resumen-diario')
  @ApiOperation({ summary: 'Resumen diario de mis asistencias' })
  @ApiResponse({ status: 200, type: [AsistenciaResumenDiarioDto] })
  resumenDiarioMio(
      @User() actor: any,
      @Query('from') from?: string,
      @Query('to') to?: string,
  ) {
    return this.asistenciaService.resumenDiarioDeUsuario(
        actor,
        actor.id_usuario,
        from,
        to,
    );
  }

  // ================================================================
  // LISTAR POR USUARIO (ADMIN/RRHH)
  // ================================================================
  @Get('usuario/:id_usuario')
  @Roles('ADMIN', 'RRHH')
  @ApiParam({ name: 'id_usuario', type: String })
  @ApiOperation({ summary: 'Listar asistencias de un usuario (ADMIN/RRHH)' })
  @ApiResponse({ status: 200, type: [AsistenciaResponseDto] })
  listarPorUsuario(@User() actor: any, @Param('id_usuario') id_usuario: string) {
    return this.asistenciaService.listarPorUsuario(actor, id_usuario);
  }

  // ================================================================
  // RESUMEN DIARIO DE USUARIO (ADMIN/RRHH)
  // ================================================================
  @Get('usuario/:id_usuario/resumen-diario')
  @Roles('ADMIN', 'RRHH')
  @ApiParam({ name: 'id_usuario', type: String })
  @ApiOperation({ summary: 'Resumen diario de un usuario (ADMIN/RRHH)' })
  @ApiResponse({ status: 200, type: [AsistenciaResumenDiarioDto] })
  resumenDiarioDeUsuario(
      @User() actor: any,
      @Param('id_usuario') id_usuario: string,
      @Query('from') from?: string,
      @Query('to') to?: string,
  ) {
    return this.asistenciaService.resumenDiarioDeUsuario(actor, id_usuario, from, to);
  }

  // ================================================================
  // CREAR MANUAL (ADMIN/RRHH)
  // ================================================================
  @Post('manual')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Crear asistencia manual (ADMIN/RRHH)' })
  @ApiResponse({ status: 201, type: AsistenciaResponseDto })
  crearManual(@User() actor: any, @Body() dto: CrearAsistenciaManualDto) {
    return this.asistenciaService.crearManual(actor, dto);
  }

  // ================================================================
  // ANULAR (ADMIN/RRHH)
  // ================================================================
  @Patch(':id_asistencia/anular')
  @Roles('ADMIN', 'RRHH')
  @ApiParam({ name: 'id_asistencia', type: String })
  @ApiOperation({ summary: 'Anular una asistencia (ADMIN/RRHH)' })
  @ApiResponse({ status: 200, type: AsistenciaResponseDto })
  anular(
      @User() actor: any,
      @Param('id_asistencia') id_asistencia: string,
      @Body() dto: AnularAsistenciaDto,
  ) {
    return this.asistenciaService.anular(actor, id_asistencia, dto);
  }
}