import { Test, TestingModule } from '@nestjs/testing';
import { AsistenciaController } from './asistencia.controller';
import { AsistenciaService } from '../services/asistencia.service';

describe('AsistenciaController', () => {
  let controller: AsistenciaController;

  const asistenciaServiceMock = {
    marcar: jest.fn(),
    misAsistencias: jest.fn(),
    listarPorUsuario: jest.fn(),
    resumenDiarioDeUsuario: jest.fn(),
    crearManual: jest.fn(),
    anular: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsistenciaController],
      providers: [{ provide: AsistenciaService, useValue: asistenciaServiceMock }],
    }).compile();

    controller = module.get<AsistenciaController>(AsistenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});