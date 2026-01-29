import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermisoService } from '../services/permiso.service';
import {
  CrearPermisoDto,
  ResolverPermisoDto,
  PermisoResponseDto,
} from '../dto/permiso.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EstadoPermiso } from '../entities/permiso.entity';

import { Audit } from '../../audit/audit.decorator';

@ApiTags('permisos')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permisos')
export class PermisoController {
  constructor(private readonly permisoService: PermisoService) {}

  @Post()
  @Roles('FUNCIONARIO', 'ADMIN', 'RRHH')
  @Audit({
    action: 'PERMISO_CREAR',
    resource: 'permiso',
    getMetadata: (ctx) => {
      const req = ctx.switchToHttp().getRequest<any>();
      const body = req.body ?? {};
      return {
        tipo: body?.tipo ?? null,
        fecha_inicio: body?.fecha_inicio ?? null,
        fecha_fin: body?.fecha_fin ?? null,
      };
    },
  })
  @ApiOperation({ summary: 'Registrar una solicitud de permiso' })
  @ApiResponse({ status: 201, description: 'Permiso registrado correctamente', type: PermisoResponseDto })
  crear(@Body() dto: CrearPermisoDto, @User() usuario: any): Promise<PermisoResponseDto> {
    return this.permisoService.crear(dto, usuario.id_usuario);
  }

  @Get('pendientes')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Listar permisos pendientes para revisión (solo RRHH o ADMIN)' })
  @ApiResponse({ status: 200, description: 'Permisos pendientes obtenidos correctamente', type: [PermisoResponseDto] })
  listarPendientes(): Promise<PermisoResponseDto[]> {
    return this.permisoService.listarPendientes();
  }

  @Get('usuario/:id_usuario')
  @Roles('ADMIN', 'RRHH')
  @ApiParam({ name: 'id_usuario', description: 'ID del usuario solicitante' })
  @ApiQuery({ name: 'estado', required: false, enum: ['ALL', EstadoPermiso.PENDIENTE, EstadoPermiso.APROBADO, EstadoPermiso.RECHAZADO], description: 'Filtro por estado (default: ALL)' })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD (filtra por solapamiento con el rango)' })
  @ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD (filtra por solapamiento con el rango)' })
  @ApiOperation({ summary: 'Listar permisos (pendientes/aprobados/rechazados) de un usuario (RRHH/ADMIN)' })
  @ApiResponse({ status: 200, description: 'Permisos del usuario obtenidos correctamente', type: [PermisoResponseDto] })
  listarDeUsuario(
      @Param('id_usuario') id_usuario: string,
      @Query('estado') estado?: 'ALL' | EstadoPermiso,
      @Query('from') from?: string,
      @Query('to') to?: string,
  ): Promise<PermisoResponseDto[]> {
    return this.permisoService.listarDeUsuarioAdmin(id_usuario, { estado, from, to });
  }

  @Patch(':id')
  @Roles('ADMIN', 'RRHH')
  @Audit({
    action: 'PERMISO_RESOLVER',
    resource: 'permiso',
    entityIdParam: 'id',
    getMetadata: (ctx) => {
      const req = ctx.switchToHttp().getRequest<any>();
      const body = req.body ?? {};
      return {
        estado: body?.estado ?? null,
        con_goce: typeof body?.con_goce === 'boolean' ? body.con_goce : null,
        observacion_resolucion: body?.observacion_resolucion ?? null,
      };
    },
  })
  @ApiOperation({ summary: 'Aprobar o rechazar un permiso (RRHH / ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del permiso a resolver' })
  @ApiResponse({ status: 200, description: 'Permiso resuelto correctamente', type: PermisoResponseDto })
  resolver(
      @Param('id') id: string,
      @Body() dto: ResolverPermisoDto,
      @User() usuario: any,
  ): Promise<PermisoResponseDto> {
    return this.permisoService.resolver(id, dto, usuario.id_usuario);
  }

  @Get('mios')
  @Roles('FUNCIONARIO', 'ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Listar permisos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Permisos del solicitante', type: [PermisoResponseDto] })
  listarMios(@User() usuario: any): Promise<PermisoResponseDto[]> {
    return this.permisoService.listarPorSolicitante(usuario.id_usuario);
  }
}