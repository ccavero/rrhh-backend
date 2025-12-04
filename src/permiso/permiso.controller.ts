import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PermisoService } from './permiso.service';

@Controller('permisos')
export class PermisoController {
  constructor(private readonly permisoService: PermisoService) {}

  // RF04 - Registrar permiso
  @Post()
  crear(@Body() body: any) {
    return this.permisoService.crear({
      tipo: body.tipo,
      motivo: body.motivo,
      fecha_inicio: body.fecha_inicio,
      fecha_fin: body.fecha_fin,
      id_solicitante: body.id_solicitante,
    });
  }

  // RF06 - Reporte de permisos (todos por ahora)
  @Get()
  listarTodos() {
    return this.permisoService.listarTodos();
  }

  // RF05 - Ver pendientes (para Admin RRHH)
  @Get('pendientes')
  listarPendientes() {
    return this.permisoService.listarPendientes();
  }

  // RF05 / RF06 - Aprobar o rechazar permiso
  @Patch(':id')
  resolver(@Param('id') id: string, @Body() body: any) {
    return this.permisoService.resolver(id, {
      estado: body.estado,
      id_resolvedor: body.id_resolvedor,
    });
  }
}
