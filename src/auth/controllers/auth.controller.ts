import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto, LoginResponseDto } from '../dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiExtraModels,
} from '@nestjs/swagger';

@ApiTags('auth')
@ApiExtraModels(LoginResponseDto)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Valida las credenciales del usuario y genera un token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso.',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos enviados incorrectos.',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas.',
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const usuario = await this.authService.validarUsuario(
      dto.email,
      dto.password,
    );

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.authService.login(usuario);
  }
}
