import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { LoginResponseDto } from '../dto/login.dto';
import { UsuarioResponseDto } from '../../usuario/dto/usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async validarUsuario(email: string, password: string): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { email },
      // importante: incluir password_hash explícitamente si lo tienes con select: false
      select: [
        'id_usuario',
        'nombre',
        'apellido',
        'email',
        'password_hash',
        'id_rol',
        'estado',
        'creado_en',
        'actualizado_en',
      ],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valido = await bcrypt.compare(password, usuario.password_hash);

    if (!valido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return usuario;
  }

  login(usuario: Usuario): LoginResponseDto {
    const payload = {
      sub: usuario.id_usuario,
      rol: usuario.id_rol,
      nombre: usuario.nombre,
    };

    const usuarioResponse: UsuarioResponseDto = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      id_rol: usuario.id_rol,
      estado: usuario.estado,
      creado_en: usuario.creado_en,
      actualizado_en: usuario.actualizado_en,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: usuarioResponse,
    };
  }
}
