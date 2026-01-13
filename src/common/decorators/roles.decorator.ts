import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';

export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
