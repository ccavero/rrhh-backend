// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export type RolUsuario = 'ADMIN' | 'FUNCIONARIO' | 'RRHH';

export interface JwtPayload {
  sub: string;
  rol: RolUsuario;
  nombre?: string;
  iat?: number;
  exp?: number;
}

function isDebugAuthEnabled(): boolean {
  return Boolean(
      process.env.AUTH_DEBUG === '1' ||
      (process.env.NODE_ENV && process.env.NODE_ENV !== 'production'),
  );
}

function maskSecret(secret: string) {
  if (!secret) return '<empty>';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
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
      algorithms: ['HS256'],
    });

    if (isDebugAuthEnabled()) {
      // eslint-disable-next-line no-console
      console.log('🔐 JWT Strategy usando JWT_SECRET =', maskSecret(secret));
    }
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