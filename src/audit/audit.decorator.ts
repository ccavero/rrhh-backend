import { SetMetadata, type ExecutionContext } from '@nestjs/common';

export const AUDIT_META_KEY = 'audit:meta';

export type AuditMeta = {
    action: string;
    resource?: string;
    entity?: string;
    entityIdParam?: string; // ej: "id"
    entityIdBodyKey?: string; // ej: "id_usuario"
    skipBody?: boolean;
    getMetadata?: (ctx: ExecutionContext) => Record<string, any> | undefined;
};

export const Audit = (meta: AuditMeta) => SetMetadata(AUDIT_META_KEY, meta);