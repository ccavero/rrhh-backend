// src/modules/usuarios/services/usuario.services.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario } from '../entities/usuario.entity';
import { JornadaLaboral } from '../entities/jornada-laboral.entity';
import {
  ActualizarUsuarioDto,
  UsuarioResponseDto,
  CrearUsuarioConJornadaDto,
} from '../dto/usuario.dto';
import { SetJornadaSemanalDto } from '../dto/jornada.dto';

type UsuarioAuth = {
  id_usuario: string;
  id_rol: 'ADMIN' | 'RRHH' | 'FUNCIONARIO' | string;
  nombre?: string;
};

@Injectable()
export class UsuarioService {
  constructor(
      @InjectRepository(Usuario)
      private readonly usuarioRepo: Repository<Usuario>,
      @InjectRepository(JornadaLaboral)
      private readonly jornadaRepo: Repository<JornadaLaboral>,
      private readonly dataSource: DataSource,
  ) {}

  private assertGestor(actor: UsuarioAuth) {
    if (!actor || (actor.id_rol !== 'ADMIN' && actor.id_rol !== 'RRHH')) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción');
    }
  }

  private sanitize(usuario: Usuario): UsuarioResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safe } = usuario as any;
    return safe as UsuarioResponseDto;
  }

  private validarJornada(
      dias: {
        dia_semana: number;
        hora_inicio: string;
        hora_fin: string;
        minutos_objetivo: number;
      }[],
  ) {
    if (!Array.isArray(dias) || dias.length === 0) {
      throw new BadRequestException('Debe enviar la jornada semanal');
    }

    for (const d of dias) {
      if (![1, 2, 3, 4, 5, 6, 7].includes(d.dia_semana)) {
        throw new BadRequestException('dia_semana debe estar entre 1 y 7');
      }
      if (!d.hora_inicio || !d.hora_fin) {
        throw new BadRequestException('hora_inicio y hora_fin son requeridos');
      }
      if (typeof d.minutos_objetivo !== 'number' || d.minutos_objetivo < 0) {
        throw new BadRequestException('minutos_objetivo inválido');
      }
    }

    const set = new Set(dias.map((x) => x.dia_semana));
    if (set.size !== dias.length) {
      throw new BadRequestException('No se permite repetir dia_semana en jornada');
    }
  }

  private async assertUsuarioExiste(id_usuario: string) {
    const u = await this.usuarioRepo.findOne({ where: { id_usuario } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async miPerfil(actor: UsuarioAuth) {
    if (!actor?.id_usuario) {
      throw new ForbiddenException('No autenticado');
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: actor.id_usuario },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.sanitize(usuario);
  }

  async miJornada(actor: UsuarioAuth) {
    if (!actor?.id_usuario) {
      throw new ForbiddenException('No autenticado');
    }

    const jornadas = await this.jornadaRepo.find({
      where: { id_usuario: actor.id_usuario },
      order: { dia_semana: 'ASC' },
    });

    return {
      id_usuario: actor.id_usuario,
      dias: jornadas,
    };
  }

  async jornadaDeUsuario(actor: UsuarioAuth, id_usuario: string) {
    this.assertGestor(actor);
    await this.assertUsuarioExiste(id_usuario);

    const jornadas = await this.jornadaRepo.find({
      where: { id_usuario },
      order: { dia_semana: 'ASC' },
    });

    return {
      id_usuario,
      dias: jornadas,
    };
  }

  async setJornada(actor: UsuarioAuth, id_usuario: string, dto: SetJornadaSemanalDto) {
    this.assertGestor(actor);
    await this.assertUsuarioExiste(id_usuario);

    this.validarJornada(dto.dias);

    await this.dataSource.transaction(async (manager) => {
      const jornadaRepoTx = manager.getRepository(JornadaLaboral);

      await jornadaRepoTx.delete({ id_usuario });

      const nuevas = dto.dias.map((d) =>
          jornadaRepoTx.create({
            id_usuario,
            dia_semana: d.dia_semana as any,
            hora_inicio: d.hora_inicio,
            hora_fin: d.hora_fin,
            minutos_objetivo: d.minutos_objetivo,
            activo: d.activo ?? true,
            tolerancia_minutos: d.tolerancia_minutos ?? 0,
          }),
      );

      await jornadaRepoTx.save(nuevas);
    });

    return this.jornadaDeUsuario(actor, id_usuario);
  }

  async crearConJornada(actor: UsuarioAuth, dto: CrearUsuarioConJornadaDto) {
    this.assertGestor(actor);

    if (actor.id_rol === 'RRHH' && dto.id_rol === 'ADMIN') {
      throw new ForbiddenException('RRHH no puede crear usuarios ADMIN');
    }

    this.validarJornada(dto.jornada?.dias);

    const email = dto.email.toLowerCase().trim();

    const existe = await this.usuarioRepo.findOne({ where: { email } });
    if (existe) {
      throw new BadRequestException('El email ya está registrado');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const result = await this.dataSource.transaction(async (manager) => {
      const usuarioRepoTx = manager.getRepository(Usuario);
      const jornadaRepoTx = manager.getRepository(JornadaLaboral);

      const nuevo = usuarioRepoTx.create({
        nombre: dto.nombre,
        apellido: dto.apellido,
        email,
        password_hash: hash,
        id_rol: dto.id_rol,
        estado: (dto as any).estado ?? 'ACTIVO',
      });

      const usuarioGuardado = await usuarioRepoTx.save(nuevo);

      const jornadas = dto.jornada.dias.map((d) =>
          jornadaRepoTx.create({
            id_usuario: usuarioGuardado.id_usuario,
            dia_semana: d.dia_semana as any,
            hora_inicio: d.hora_inicio,
            hora_fin: d.hora_fin,
            minutos_objetivo: d.minutos_objetivo,
            activo: d.activo ?? true,
            tolerancia_minutos: d.tolerancia_minutos ?? 0,
          }),
      );

      await jornadaRepoTx.save(jornadas);

      return usuarioGuardado;
    });

    return this.sanitize(result);
  }

  async listar(actor: UsuarioAuth) {
    this.assertGestor(actor);
    return this.usuarioRepo.find();
  }

  async buscar(actor: UsuarioAuth, id: string) {
    this.assertGestor(actor);

    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async actualizar(actor: UsuarioAuth, id: string, dto: ActualizarUsuarioDto) {
    this.assertGestor(actor);

    const usuario = await this.buscar(actor, id);

    if (actor.id_rol === 'RRHH' && dto.id_rol === 'ADMIN') {
      throw new ForbiddenException('RRHH no puede asignar rol ADMIN');
    }

    let passwordHash: string | undefined;

    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const { password, ...resto } = dto as any;

    if (typeof resto.email === 'string') {
      resto.email = resto.email.toLowerCase().trim();
    }

    Object.assign(usuario, resto);

    if (passwordHash) {
      (usuario as any).password_hash = passwordHash;
    }

    const actualizado = await this.usuarioRepo.save(usuario);
    return this.sanitize(actualizado as any);
  }

  async eliminar(actor: UsuarioAuth, id: string) {
    this.assertGestor(actor);

    const usuario = await this.buscar(actor, id);
    await this.usuarioRepo.remove(usuario);

    return { mensaje: 'Usuario eliminado' };
  }
}