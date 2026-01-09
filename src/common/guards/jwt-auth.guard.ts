import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

function isDebugAuthEnabled(): boolean {
  return Boolean(
      process.env.AUTH_DEBUG === '1' ||
      (process.env.NODE_ENV && process.env.NODE_ENV !== 'production'),
  );
}

function maskAuthHeader(value: unknown) {
  if (typeof value !== 'string') return value;

  if (value.toLowerCase().startsWith('bearer ')) {
    const token = value.slice(7);
    const head = token.slice(0, 8);
    return `Bearer ${head}...<masked>`;
  }

  return '<non-bearer-auth>';
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    if (isDebugAuthEnabled()) {
      const req = context.switchToHttp().getRequest();
      // eslint-disable-next-line no-console
      console.log(
          '🔐 JwtAuthGuard Authorization:',
          maskAuthHeader(req.headers?.authorization),
      );
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: any) {
    if (isDebugAuthEnabled()) {
      // eslint-disable-next-line no-console
      console.log('🔐 JwtAuthGuard.handleRequest err:', err?.message ?? err);
      // eslint-disable-next-line no-console
      console.log(
          '🔐 JwtAuthGuard.handleRequest user:',
          user ? { id_usuario: user.id_usuario, id_rol: user.id_rol } : null,
      );
      // eslint-disable-next-line no-console
      console.log('🔐 JwtAuthGuard.handleRequest info:', info?.message ?? info);
    }

    return super.handleRequest(err, user, info, context);
  }
}