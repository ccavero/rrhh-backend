import { Test, TestingModule } from '@nestjs/testing';

import { PermisoController } from './permiso.controller';
import { PermisoService } from '../services/permiso.service';

describe('PermisoController', () => {
  let controller: PermisoController;

  const permisoServiceMock = {
    misPermisos: jest.fn(),
    crear: jest.fn(),
    pendientes: jest.fn(),
    resolver: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermisoController],
      providers: [{ provide: PermisoService, useValue: permisoServiceMock }],
    }).compile();

    controller = module.get<PermisoController>(PermisoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});