import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    console.log(
      '🔐 JwtAuthGuard - Authorization header:',
      req.headers.authorization,
    );
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: any) {
    console.log('🔐 JwtAuthGuard.handleRequest → err:', err);
    console.log('🔐 JwtAuthGuard.handleRequest → user:', user);
    console.log('🔐 JwtAuthGuard.handleRequest → info:', info);
    // Si quieres que falle igual
    return super.handleRequest(err, user, info, context);
  }
}
