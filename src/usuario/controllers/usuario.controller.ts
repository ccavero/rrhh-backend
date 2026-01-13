// src/usuario/controllers/usuario.controller.ts
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

@ApiTags('usuarios')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener mi perfil (solo lectura)' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario autenticado',
    type: UsuarioResponseDto,
  })
  miPerfil(@User() actor: any) {
    return this.usuarioService.miPerfil(actor);
  }

  @Get('me/jornada')
  @ApiOperation({ summary: 'Obtener mi jornada semanal' })
  @ApiResponse({ status: 200, description: 'Jornada del usuario autenticado' })
  miJornada(@User() actor: any) {
    return this.usuarioService.miJornada(actor);
  }

  @Get(':id/jornada')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Obtener jornada semanal de un usuario (RRHH/ADMIN)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Jornada del usuario' })
  jornadaDeUsuario(@User() actor: any, @Param('id') id: string) {
    return this.usuarioService.jornadaDeUsuario(actor, id);
  }

  @Put(':id/jornada')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Reemplazar jornada semanal de un usuario (RRHH/ADMIN)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Jornada actualizada' })
  setJornada(
      @User() actor: any,
      @Param('id') id: string,
      @Body() dto: SetJornadaSemanalDto,
  ) {
    return this.usuarioService.setJornada(actor, id, dto);
  }

  @Post()
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Crear un nuevo usuario (incluye jornada semanal)' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UsuarioResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  crear(@User() actor: any, @Body() dto: CrearUsuarioConJornadaDto) {
    return this.usuarioService.crearConJornada(actor, dto);
  }

  @Get()
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Listado de usuarios obtenido',
    type: UsuarioResponseDto,
    isArray: true,
  })
  listar(@User() actor: any) {
    return this.usuarioService.listar(actor);
  }

  @Get(':id')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Buscar un usuario por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: UsuarioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  buscar(@User() actor: any, @Param('id') id: string) {
    return this.usuarioService.buscar(actor, id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    type: UsuarioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  actualizar(
      @User() actor: any,
      @Param('id') id: string,
      @Body() dto: ActualizarUsuarioDto,
  ) {
    return this.usuarioService.actualizar(actor, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'RRHH')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  eliminar(@User() actor: any, @Param('id') id: string) {
    return this.usuarioService.eliminar(actor, id);
  }
}