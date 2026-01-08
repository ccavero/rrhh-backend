import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si el endpoint no requiere roles → permitir acceso
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Caso 1: usuario no autenticado
    if (!user) {
      throw new UnauthorizedException('Debe autenticarse primero.');
    }

    // Caso 2: usuario sin rol asignado
    if (!user.id_rol) {
      throw new ForbiddenException('Usuario sin rol asignado.');
    }

    // Caso 3: usuario autenticado pero sin permiso
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (!requiredRoles.includes(user.id_rol)) {
      throw new ForbiddenException('No tiene permisos para acceder.');
    }

    return true;
  }
}
