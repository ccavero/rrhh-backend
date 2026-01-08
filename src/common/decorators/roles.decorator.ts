import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Tipo opcional pero útil en desarrollo
export type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';

export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
