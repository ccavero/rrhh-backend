import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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

import { CargoService } from '../services/cargo.service';
import { CrearCargoDto } from '../dto/cargo.dto';
import { CrearUnidadDto } from '../dto/unidad.dto';
import { RegistrarMovimientoCargoDto } from '../dto/movimiento.dto';

@ApiTags('cargos')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CargoController {
    constructor(private readonly service: CargoService) {}

    @Roles('ADMIN', 'RRHH')
    @Get('cargos')
    @ApiOperation({ summary: 'Listar cargos (ADMIN/RRHH)' })
    @ApiResponse({ status: 200, description: 'Listado de cargos' })
    listarCargos(@User() actor: any) {
        return this.service.listarCargos(actor);
    }

    @Roles('ADMIN', 'RRHH')
    @Post('cargos')
    @Audit({
        action: 'CARGO_CREAR',
        resource: 'cargo',
        getMetadata: (ctx) => {
            const req = ctx.switchToHttp().getRequest<any>();
            return { nombre: req.body?.nombre ?? null, codigo: req.body?.codigo ?? null };
        },
    })
    @ApiOperation({ summary: 'Crear cargo (ADMIN/RRHH)' })
    @ApiResponse({ status: 201, description: 'Cargo creado' })
    crearCargo(@User() actor: any, @Body() dto: CrearCargoDto) {
        return this.service.crearCargo(actor, dto);
    }

    @Roles('ADMIN', 'RRHH')
    @Get('unidades')
    @ApiOperation({ summary: 'Listar unidades (ADMIN/RRHH)' })
    @ApiResponse({ status: 200, description: 'Listado de unidades' })
    listarUnidades(@User() actor: any) {
        return this.service.listarUnidades(actor);
    }

    @Roles('ADMIN', 'RRHH')
    @Post('unidades')
    @Audit({
        action: 'UNIDAD_CREAR',
        resource: 'unidad',
        getMetadata: (ctx) => {
            const req = ctx.switchToHttp().getRequest<any>();
            return { nombre: req.body?.nombre ?? null };
        },
    })
    @ApiOperation({ summary: 'Crear unidad (ADMIN/RRHH)' })
    @ApiResponse({ status: 201, description: 'Unidad creada' })
    crearUnidad(@User() actor: any, @Body() dto: CrearUnidadDto) {
        return this.service.crearUnidad(actor, dto);
    }

    @Roles('ADMIN', 'RRHH')
    @Get('usuarios/:id_usuario/cargo/movimientos')
    @ApiOperation({ summary: 'Ver movimientos de cargo de un usuario (ADMIN/RRHH)' })
    @ApiParam({ name: 'id_usuario', type: String })
    @ApiResponse({ status: 200, description: 'Movimientos del usuario' })
    movimientos(@User() actor: any, @Param('id_usuario') id_usuario: string) {
        return this.service.movimientosDeUsuario(actor, id_usuario);
    }

    @Roles('ADMIN', 'RRHH')
    @Post('usuarios/:id_usuario/cargo/movimientos')
    @Audit({
        action: 'CARGO_REGISTRAR_MOVIMIENTO',
        resource: 'cargo_movimiento',
        entityIdParam: 'id_usuario', // en este caso, el "objeto" principal es el usuario afectado
        getMetadata: (ctx) => {
            const req = ctx.switchToHttp().getRequest<any>();
            const body = req.body ?? {};
            return {
                tipo: body?.tipo ?? null,
                fecha_inicio: body?.fecha_inicio ?? null,
                id_cargo: body?.id_cargo ?? null,
                id_unidad: body?.id_unidad ?? null,
            };
        },
    })
    @ApiOperation({ summary: 'Registrar movimiento de cargo de un usuario (ADMIN/RRHH)' })
    @ApiParam({ name: 'id_usuario', type: String })
    @ApiResponse({ status: 201, description: 'Movimiento registrado' })
    registrar(
        @User() actor: any,
        @Param('id_usuario') id_usuario: string,
        @Body() dto: RegistrarMovimientoCargoDto,
    ) {
        return this.service.registrarMovimiento(actor, id_usuario, dto);
    }
}