import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

type Actor = {
  id_usuario?: string;
  id_rol?: string;
  nombre?: string;
};

function normalizeRole(r: unknown): string {
  return String(r ?? '').trim().toUpperCase();
}

function isDebugAuthEnabled(): boolean {
  return Boolean(
      process.env.AUTH_DEBUG === '1' ||
      (process.env.NODE_ENV && process.env.NODE_ENV !== 'production'),
  );
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const meta = this.reflector.getAllAndOverride<string[] | string>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!meta) return true;

    const requiredRoles = (Array.isArray(meta) ? meta : [meta]).map(
        normalizeRole,
    );

    const request = context.switchToHttp().getRequest<{ user?: Actor }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Debe autenticarse primero.');
    }

    const userRole = normalizeRole(user.id_rol);

    if (!userRole) {
      throw new ForbiddenException('Usuario sin rol asignado.');
    }

    if (!requiredRoles.includes(userRole)) {
      if (isDebugAuthEnabled()) {
        // eslint-disable-next-line no-console
        console.log('⛔ RolesGuard denied:', {
          user: { id_usuario: user.id_usuario, id_rol: userRole },
          requiredRoles,
        });
      }
      throw new ForbiddenException('No tiene permisos para acceder.');
    }

    return true;
  }
}