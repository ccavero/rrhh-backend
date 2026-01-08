import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UsuarioResponseDto } from '../../usuario/dto/usuario.dto';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@agetic.gob.bo',
    description: 'Correo institucional del usuario',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({
    example: '12345678',
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT para autenticación',
  })
  access_token: string;

  @ApiProperty({
    description: 'Datos del usuario autenticado',
    type: UsuarioResponseDto,
  })
  usuario: UsuarioResponseDto;
}
