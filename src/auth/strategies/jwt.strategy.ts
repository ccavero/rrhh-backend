import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export type RolUsuario = 'ADMIN' | 'FUNCIONARIO' | 'RRHH';

export interface JwtPayload {
  sub: string;        // id_usuario
  rol: RolUsuario;    // rol
  nombre?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en el .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    // log útil en dev (si te molesta, quítalo)
    console.log('JWT Strategy usando JWT_SECRET =', secret);
  }

  validate(payload: JwtPayload) {
    if (!payload?.sub || !payload?.rol) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      id_usuario: payload.sub,
      id_rol: payload.rol,
      nombre: payload.nombre ?? '',
    };
  }
}