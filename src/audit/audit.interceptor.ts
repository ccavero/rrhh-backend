import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuditService } from './audit.service';
import { AUDIT_META_KEY, AuditMeta } from './audit.decorator';

function pickSafe(obj: any, maxLen = 2000) {
    try {
        if (!obj) return null;
        const json = JSON.stringify(obj);
        if (json.length <= maxLen) return obj;
        return { _truncated: true, size: json.length };
    } catch {
        return { _unserializable: true };
    }
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        private readonly audit: AuditService,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();

        const user = req?.user ?? null;
        const method = String(req?.method ?? '');
        const routePath =
            req?.route?.path ? String(req.route.path) : String(req?.url ?? '');
        const fullPath = String(req?.originalUrl ?? req?.url ?? routePath);

        const meta =
            this.reflector.get<AuditMeta>(AUDIT_META_KEY, context.getHandler()) ??
            this.reflector.get<AuditMeta>(AUDIT_META_KEY, context.getClass()) ??
            null;

        const accion = meta?.action ?? `${method} ${routePath}`;

        const entidad = meta?.entity ?? null;

        let entidadId: string | null = null;
        if (meta?.entityIdParam && req?.params?.[meta.entityIdParam]) {
            entidadId = String(req.params[meta.entityIdParam]);
        } else if (meta?.entityIdBodyKey && req?.body?.[meta.entityIdBodyKey]) {
            entidadId = String(req.body[meta.entityIdBodyKey]);
        }

        const metadata = {
            params: pickSafe(req?.params),
            query: pickSafe(req?.query),
            body: meta?.skipBody ? { _skipped: true } : pickSafe(req?.body),
        };

        const base = {
            actor_id_usuario: user?.id_usuario ?? null,
            actor_rol: user?.id_rol ?? null,
            actor_nombre: user?.nombre ?? null,

            accion,
            metodo: method,
            ruta: fullPath,

            entidad,
            entidad_id: entidadId,
            metadata,
        };

        return next.handle().pipe(
            tap(() => {
                void this.audit.create({
                    ...base,
                    resultado: 'OK',
                    status_code: Number(res?.statusCode ?? 200),
                });
            }),
            catchError((err) => {
                void this.audit.create({
                    ...base,
                    resultado: 'ERROR',
                    status_code: Number(res?.statusCode ?? 500),
                    metadata: {
                        ...metadata,
                        error: {
                            message: err?.message ?? String(err),
                            name: err?.name,
                        },
                    },
                });

                return throwError(() => err);
            }),
        );
    }
}