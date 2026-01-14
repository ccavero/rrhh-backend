import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PermisoService } from './permiso.service';

import { Permiso } from '../entities/permiso.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

describe('PermisoService', () => {
  let service: PermisoService;

  const permisoRepoMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const usuarioRepoMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermisoService,
        { provide: getRepositoryToken(Permiso), useValue: permisoRepoMock },
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepoMock },
      ],
    }).compile();

    service = module.get<PermisoService>(PermisoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});