import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UsuarioService } from '../services/usuario.service';
import {
  ActualizarUsuarioDto,
  UsuarioResponseDto,
  CrearUsuarioConJornadaDto,
} from '../dto/usuario.dto';
import { SetJornadaSemanalDto } from '../dto/jornada.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../../common/decorators/user.decorator';

import { Audit } from '../../audit/audit.decorator';

@ApiTags('usuarios')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener mi perfil (solo lectura)' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario autenticado', type: UsuarioResponseDto })
  miPerfil(@User() actor: any) {
    return this.usuarioService.miPerfil(actor);
  }

  @Get('me/jornada')
  @ApiOperation({ summary: 'Obtener mi jornada semanal' })
  miJornada(@User() actor: any) {
    return this.usuarioService.miJornada(actor);
  }

  @Get(':id/jornada')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Obtener jornada semanal de un usuario (RRHH/ADMIN)' })
  @ApiParam({ name: 'id', type: String })
  jornadaDeUsuario(@User() actor: any, @Param('id') id: string) {
    return this.usuarioService.jornadaDeUsuario(actor, id);
  }

  @Put(':id/jornada')
  @Roles('ADMIN', 'RRHH')
  @Audit({
    action: 'USUARIO_SET_JORNADA',
    resource: 'usuario',
    entityIdParam: 'id',
    getMetadata: (ctx) => {
      const req = ctx.switchToHttp().getRequest<any>();
      // ojo: jornada puede ser grande; guardo solo resumen para no inflar
      const dias = Array.isArray(req.body?.dias) ? req.body.dias.length : undefined;
      return { dias_count: dias ?? null };
    },
  })
  @ApiOperation({ summary: 'Reemplazar jornada semanal de un usuario (RRHH/ADMIN)' })
  @ApiParam({ name: 'id', type: String })
  setJornada(
      @User() actor: any,
      @Param('id') id: string,
      @Body() dto: SetJornadaSemanalDto,
  ) {
    return this.usuarioService.setJornada(actor, id, dto);
  }

  @Post()
  @Roles('ADMIN', 'RRHH')
  @Audit({
    action: 'USUARIO_CREAR',
    resource: 'usuario',
    getMetadata: (ctx) => {
      const req = ctx.switchToHttp().getRequest<any>();
      const b = req.body ?? {};
      return { email: b?.email ?? null, id_rol: b?.id_rol ?? null };
    },
  })
  @ApiOperation({ summary: 'Crear un nuevo usuario (incluye jornada semanal)' })
  crear(@User() actor: any, @Body() dto: CrearUsuarioConJornadaDto) {
    return this.usuarioService.crearConJornada(actor, dto);
  }

  @Get()
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  listar(@User() actor: any) {
    return this.usuarioService.listar(actor);
  }

  @Get(':id')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Buscar un usuario por ID' })
  @ApiParam({ name: 'id', type: String })
  buscar(@User() actor: any, @Param('id') id: string) {
    return this.usuarioService.buscar(actor, id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RRHH')
  @Audit({
    action: 'USUARIO_ACTUALIZAR',
    resource: 'usuario',
    entityIdParam: 'id',
    getMetadata: (ctx) => {
      const req = ctx.switchToHttp().getRequest<any>();
      const b = req.body ?? {};
      return {
        nombre: b?.nombre ?? null,
        apellido: b?.apellido ?? null,
        email: b?.email ?? null,
        id_rol: b?.id_rol ?? null,
        estado: b?.estado ?? null,
      };
    },
  })
  @ApiOperation({ summary: 'Actualizar un usuario' })
  actualizar(
      @User() actor: any,
      @Param('id') id: string,
      @Body() dto: ActualizarUsuarioDto,
  ) {
    return this.usuarioService.actualizar(actor, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'RRHH')
  @Audit({
    action: 'USUARIO_ELIMINAR',
    resource: 'usuario',
    entityIdParam: 'id',
  })
  @ApiOperation({ summary: 'Eliminar un usuario' })
  eliminar(@User() actor: any, @Param('id') id: string) {
    return this.usuarioService.eliminar(actor, id);
  }
}