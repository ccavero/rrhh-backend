import { Body, Controller, Get, Post } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';

@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Post()
  crear(@Body() body: any) {
    // Para PC2 lo dejamos simple, luego podemos agregar DTOs y validación
    return this.asistenciaService.crear({
      id_usuario: body.id_usuario,
      tipo: body.tipo,
      origen: body.origen,
      ip_registro: body.ip_registro,
    });
  }

  @Get()
  listar() {
    return this.asistenciaService.listarTodas();
  }
}
