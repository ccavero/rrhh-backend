import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from '../services/usuario.service';

describe('UsuarioController', () => {
  let controller: UsuarioController;

  const usuarioServiceMock = {
    miPerfil: jest.fn(),
    miJornada: jest.fn(),
    listar: jest.fn(),
    buscar: jest.fn(),
    crearConJornada: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
    setJornada: jest.fn(),
    jornadaDeUsuario: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [{ provide: UsuarioService, useValue: usuarioServiceMock }],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});