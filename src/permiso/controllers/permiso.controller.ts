// src/permiso/controllers/permiso.controller.ts
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
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
} from '@nestjs/swagger';

@ApiTags('permisos')
@ApiBearerAuth('jwt') // ✅ IMPORTANTE: debe coincidir con el nombre del esquema en main.ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permisos')
export class PermisoController {
  constructor(private readonly permisoService: PermisoService) {}

  // ======================================================
  // CREAR PERMISO (cualquier usuario autenticado)
  // ======================================================
  @Post()
  @Roles('FUNCIONARIO', 'ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Registrar una solicitud de permiso' })
  @ApiResponse({
    status: 201,
    description: 'Permiso registrado correctamente',
    type: PermisoResponseDto,
  })
  crear(
      @Body() dto: CrearPermisoDto,
      @User() usuario: any,
  ): Promise<PermisoResponseDto> {
    // El solicitante se obtiene SIEMPRE del token
    return this.permisoService.crear(dto, usuario.id_usuario);
  }

  // ======================================================
  // LISTAR PENDIENTES (RRHH / ADMIN)
  // ======================================================
  @Get('pendientes')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({
    summary: 'Listar permisos pendientes para revisión (solo RRHH o ADMIN)',
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos pendientes obtenidos correctamente',
    type: [PermisoResponseDto],
  })
  listarPendientes(): Promise<PermisoResponseDto[]> {
    return this.permisoService.listarPendientes();
  }

  // ======================================================
  // RESOLVER PERMISO (RRHH / ADMIN)
  // ======================================================
  @Patch(':id')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({
    summary: 'Aprobar o rechazar un permiso (RRHH / ADMIN)',
    description:
        'Permite decidir el estado (APROBADO/RECHAZADO) y si es con goce (pago) cuando se aprueba.',
  })
  @ApiParam({ name: 'id', description: 'ID del permiso a resolver' })
  @ApiResponse({
    status: 200,
    description: 'Permiso resuelto correctamente',
    type: PermisoResponseDto,
  })
  resolver(
      @Param('id') id: string,
      @Body() dto: ResolverPermisoDto,
      @User() usuario: any,
  ): Promise<PermisoResponseDto> {
    // El resolvedor (RRHH/ADMIN) se obtiene del token
    return this.permisoService.resolver(id, dto, usuario.id_usuario);
  }

  @Get('mios')
  @Roles('FUNCIONARIO', 'ADMIN', 'RRHH')
  @ApiOperation({
    summary: 'Listar permisos del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos del solicitante',
    type: [PermisoResponseDto],
  })
  listarMios(@User() usuario: any): Promise<PermisoResponseDto[]> {
    return this.permisoService.listarPorSolicitante(usuario.id_usuario);
  }
}