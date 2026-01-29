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

import { Audit } from '../../audit/audit.decorator';

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
    todas(@User() actor: any) {
        return this.service.todas(actor);
    }

    @Roles('ADMIN', 'RRHH')
    @Post()
    @Audit({
        action: 'TAREA_CREAR',
        resource: 'tarea',
        getMetadata: (ctx) => {
            const req = ctx.switchToHttp().getRequest<any>();
            const b = req.body ?? {};
            return {
                titulo: b?.titulo ?? null,
                id_asignado_a: b?.id_asignado_a ?? null,
                fecha_limite: b?.fecha_limite ?? null,
            };
        },
    })
    @ApiOperation({ summary: 'Crear tarea (ADMIN/RRHH)' })
    crear(@User() actor: any, @Body() dto: CrearTareaDto) {
        return this.service.crear(actor, dto);
    }

    @Roles('ADMIN', 'RRHH')
    @Patch(':id_tarea')
    @Audit({
        action: 'TAREA_ACTUALIZAR',
        resource: 'tarea',
        entityIdParam: 'id_tarea',
        getMetadata: (ctx) => {
            const req = ctx.switchToHttp().getRequest<any>();
            const b = req.body ?? {};
            return {
                titulo: b?.titulo ?? null,
                descripcion: b?.descripcion ?? null,
                fecha_limite: b?.fecha_limite ?? null,
                id_asignado_a: b?.id_asignado_a ?? null,
            };
        },
    })
    @ApiOperation({ summary: 'Actualizar una tarea (ADMIN/RRHH)' })
    @ApiParam({ name: 'id_tarea', type: String })
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
    deUsuario(@User() actor: any, @Param('id_usuario') id_usuario: string) {
        return this.service.deUsuario(actor, id_usuario);
    }

    @Get('mias')
    @ApiOperation({ summary: 'Ver mis tareas (usuario autenticado)' })
    mias(@User() actor: any) {
        return this.service.mias(actor);
    }

    @Roles('ADMIN', 'RRHH')
    @Get('asignadas')
    @ApiOperation({ summary: 'Ver tareas asignadas por mí (ADMIN/RRHH)' })
    asignadas(@User() actor: any) {
        return this.service.asignadasPorMi(actor);
    }

    @Patch(':id_tarea/estado')
    @Audit({
        action: 'TAREA_CAMBIAR_ESTADO',
        resource: 'tarea',
        entityIdParam: 'id_tarea',
        getMetadata: (ctx) => {
            const req = ctx.switchToHttp().getRequest<any>();
            return { estado: req.body?.estado ?? null };
        },
    })
    @ApiOperation({ summary: 'Cambiar estado de una tarea (asignado o ADMIN/RRHH)' })
    @ApiParam({ name: 'id_tarea', type: String })
    cambiarEstado(
        @User() actor: any,
        @Param('id_tarea') id_tarea: string,
        @Body() dto: CambiarEstadoTareaDto,
    ) {
        return this.service.cambiarEstado(actor, id_tarea, dto);
    }
}