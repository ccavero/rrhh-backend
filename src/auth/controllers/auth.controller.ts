import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto, LoginResponseDto } from '../dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Valida las credenciales del usuario y genera un token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso.',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Datos enviados incorrectos.' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas.' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const usuario = await this.authService.validarUsuario(dto.email, dto.password);
    return this.authService.login(usuario);
  }
}