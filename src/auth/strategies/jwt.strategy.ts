import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type RolUsuario = 'ADMIN' | 'FUNCIONARIO' | 'RRHH';

interface JwtPayload {
  sub: string;
  rol: RolUsuario;
  nombre: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: String(process.env.JWT_SECRET),
    });

    console.log('JWT Strategy usando JWT_SECRET =', process.env.JWT_SECRET);
  }

  validate(payload: JwtPayload) {
    return {
      id_usuario: payload.sub,
      id_rol: payload.rol,
      nombre: payload.nombre,
    };
  }
}
