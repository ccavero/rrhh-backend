import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { CrearUsuarioDto, ActualizarUsuarioDto } from '../dto/usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async crear(dto: CrearUsuarioDto) {
    const existe = await this.usuarioRepo.findOne({
      where: { email: dto.email },
    });

    if (existe) {
      throw new BadRequestException('El email ya está registrado');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const nuevo = this.usuarioRepo.create({
      nombre: dto.nombre,
      apellido: dto.apellido,
      email: dto.email,
      password_hash: hash,
      id_rol: dto.id_rol,
      estado: 'ACTIVO',
    });

    const usuarioGuardado = await this.usuarioRepo.save(nuevo);

    // por seguridad, no devolver el hash
    // @ts-expect-error (si TS se queja, pero en runtime existe)
    delete usuarioGuardado.password_hash;

    return usuarioGuardado;
  }

  async listar() {
    return this.usuarioRepo.find();
  }

  async buscar(id: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async actualizar(id: string, dto: ActualizarUsuarioDto) {
    const usuario = await this.buscar(id);

    let passwordHash: string | undefined;

    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    // Separamos password del resto de campos
    const { password, ...resto } = dto;

    Object.assign(usuario, resto);

    if (passwordHash) {
      usuario.password_hash = passwordHash;
    }

    const actualizado = await this.usuarioRepo.save(usuario);

    // por seguridad, no devolver el hash
    // @ts-expect-error
    delete actualizado.password_hash;

    return actualizado;
  }

  async eliminar(id: string) {
    const usuario = await this.buscar(id);
    await this.usuarioRepo.remove(usuario);
    return { mensaje: 'Usuario eliminado' };
  }
}
