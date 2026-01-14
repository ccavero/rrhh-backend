import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { AsistenciaService } from './asistencia.service';
import { PermisoService } from '../../permiso/services/permiso.service';

import { Asistencia } from '../entities/asistencia.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { JornadaLaboral } from '../../usuario/entities/jornada-laboral.entity';

describe('AsistenciaService - marcar()', () => {
  let service: AsistenciaService;

  const asistenciaRepoMock = {
    exist: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const usuarioRepoMock = {
    findOne: jest.fn(),
  };

  const jornadaRepoMock = {
    findOne: jest.fn(),
  };

  const permisoServiceMock = {
    tienePermisoAprobadoEnFecha: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsistenciaService,
        { provide: getRepositoryToken(Asistencia), useValue: asistenciaRepoMock },
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepoMock },
        { provide: getRepositoryToken(JornadaLaboral), useValue: jornadaRepoMock },
        { provide: PermisoService, useValue: permisoServiceMock },
      ],
    }).compile();

    service = module.get<AsistenciaService>(AsistenciaService);
  });

  it('bloquea si no hay actor autenticado', async () => {
    await expect(
        service.marcar(null as any, { tipo: 'ENTRADA', origen: 'web' } as any, '1.2.3.4'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('bloquea si hay permiso aprobado en la fecha', async () => {
    usuarioRepoMock.findOne.mockResolvedValue({ id_usuario: 'u1' } as any);
    permisoServiceMock.tienePermisoAprobadoEnFecha.mockResolvedValue({ bloquea: true });

    await expect(
        service.marcar(
            { id_usuario: 'u1', id_rol: 'FUNCIONARIO' },
            { tipo: 'ENTRADA', origen: 'web' } as any,
            '1.2.3.4',
        ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(permisoServiceMock.tienePermisoAprobadoEnFecha).toHaveBeenCalled();
    expect(asistenciaRepoMock.save).not.toHaveBeenCalled();
  });

  it('bloquea SALIDA si no existe ENTRADA previa hoy', async () => {
    usuarioRepoMock.findOne.mockResolvedValue({ id_usuario: 'u1' } as any);
    permisoServiceMock.tienePermisoAprobadoEnFecha.mockResolvedValue({ bloquea: false });

    asistenciaRepoMock.exist.mockResolvedValue(false);
    asistenciaRepoMock.findOne.mockResolvedValue(null);

    await expect(
        service.marcar(
            { id_usuario: 'u1', id_rol: 'FUNCIONARIO' },
            { tipo: 'SALIDA', origen: 'web' } as any,
            '1.2.3.4',
        ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(asistenciaRepoMock.save).not.toHaveBeenCalled();
  });

  it('OK: guarda y devuelve la asistencia completa', async () => {
    usuarioRepoMock.findOne.mockResolvedValue({ id_usuario: 'u1' } as any);
    permisoServiceMock.tienePermisoAprobadoEnFecha.mockResolvedValue({ bloquea: false });

    asistenciaRepoMock.exist.mockResolvedValue(false);

    asistenciaRepoMock.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id_asistencia: 'a1', tipo: 'ENTRADA' } as any);

    asistenciaRepoMock.create.mockImplementation((x: any) => x);
    asistenciaRepoMock.save.mockResolvedValue({ id_asistencia: 'a1' });

    const res = await service.marcar(
        { id_usuario: 'u1', id_rol: 'FUNCIONARIO' },
        { tipo: 'ENTRADA', origen: 'web' } as any,
        '1.2.3.4',
    );

    expect(asistenciaRepoMock.save).toHaveBeenCalledTimes(1);
    expect(asistenciaRepoMock.findOne).toHaveBeenCalledTimes(2);
    expect(res).toEqual({ id_asistencia: 'a1', tipo: 'ENTRADA' });
  });
});