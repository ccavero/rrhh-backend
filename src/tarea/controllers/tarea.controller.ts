// src/tarea/controllers/tarea.controller.ts
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';

import { TareaService } from '../services/tarea.service';
import {
    ActualizarTareaDto,
    CambiarEstadoTareaDto,
    CrearTareaDto,
} from '../dto/tarea.dto';

@ApiTags('tareas')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tareas')
export class TareaController {
    constructor(private readonly service: TareaService) {}

    @Roles('ADMIN', 'RRHH')
    @Get()
    @ApiOperation({ summary: 'Ver todas las tareas (ADMIN/RRHH)' })
    @ApiResponse({ status: 200, description: 'Listado de tareas' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    todas(@User() actor: any) {
        return this.service.todas(actor);
    }

    @Roles('ADMIN', 'RRHH')
    @Post()
    @ApiOperation({ summary: 'Crear tarea (ADMIN/RRHH)' })
    @ApiResponse({ status: 201, description: 'Tarea creada' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    crear(@User() actor: any, @Body() dto: CrearTareaDto) {
        return this.service.crear(actor, dto);
    }

    @Roles('ADMIN', 'RRHH')
    @Patch(':id_tarea')
    @ApiOperation({ summary: 'Actualizar una tarea (ADMIN/RRHH)' })
    @ApiParam({ name: 'id_tarea', type: String })
    @ApiResponse({ status: 200, description: 'Tarea actualizada' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Tarea no encontrada / Usuario no encontrado' })
    actualizar(
        @User() actor: any,
        @Param('id_tarea') id_tarea: string,
        @Body() dto: ActualizarTareaDto,
    ) {
        return this.service.actualizar(actor, id_tarea, dto);
    }

    @Roles('ADMIN', 'RRHH')
    @Get('usuario/:id_usuario')
    @ApiOperation({ summary: 'Ver tareas de un usuario (ADMIN/RRHH)' })
    @ApiParam({ name: 'id_usuario', type: String })
    @ApiResponse({ status: 200, description: 'Listado de tareas del usuario' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    deUsuario(@User() actor: any, @Param('id_usuario') id_usuario: string) {
        return this.service.deUsuario(actor, id_usuario);
    }

    @Get('mias')
    @ApiOperation({ summary: 'Ver mis tareas (usuario autenticado)' })
    @ApiResponse({ status: 200, description: 'Listado de mis tareas' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    mias(@User() actor: any) {
        return this.service.mias(actor);
    }

    @Roles('ADMIN', 'RRHH')
    @Get('asignadas')
    @ApiOperation({ summary: 'Ver tareas asignadas por mí (ADMIN/RRHH)' })
    @ApiResponse({
        status: 200,
        description: 'Listado de tareas asignadas por el actor',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    asignadas(@User() actor: any) {
        return this.service.asignadasPorMi(actor);
    }

    @Patch(':id_tarea/estado')
    @ApiOperation({
        summary: 'Cambiar estado de una tarea (asignado o ADMIN/RRHH)',
    })
    @ApiParam({ name: 'id_tarea', type: String })
    @ApiResponse({ status: 200, description: 'Tarea actualizada' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
    cambiarEstado(
        @User() actor: any,
        @Param('id_tarea') id_tarea: string,
        @Body() dto: CambiarEstadoTareaDto,
    ) {
        return this.service.cambiarEstado(actor, id_tarea, dto);
    }
}