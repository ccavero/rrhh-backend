import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UsuarioService } from './usuario.service';
import { Usuario } from '../entities/usuario.entity';
import { JornadaLaboral } from '../entities/jornada-laboral.entity';

describe('UsuarioService', () => {
  let service: UsuarioService;

  const usuarioRepoMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const jornadaRepoMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const dataSourceMock = {
    transaction: jest.fn(async (cb: any) => {
      const manager = {
        getRepository: jest.fn((entity: any) => {
          if (entity === Usuario) return usuarioRepoMock;
          if (entity === JornadaLaboral) return jornadaRepoMock;
          return {};
        }),
      };
      return cb(manager);
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepoMock },
        { provide: getRepositoryToken(JornadaLaboral), useValue: jornadaRepoMock },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});