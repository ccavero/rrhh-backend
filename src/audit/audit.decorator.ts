import { SetMetadata } from '@nestjs/common';

export const AUDIT_META_KEY = 'audit:meta';

export type AuditMeta = {
    action: string;
    entity?: string;
    // para extraer entidad_id automáticamente desde params (ej: :id)
    entityIdParam?: string; // ej: "id"
    // o desde el body (ej: id_usuario)
    entityIdBodyKey?: string; // ej: "id_usuario"
    // si quieres excluir body del log
    skipBody?: boolean;
};

export const Audit = (meta: AuditMeta) => SetMetadata(AUDIT_META_KEY, meta);