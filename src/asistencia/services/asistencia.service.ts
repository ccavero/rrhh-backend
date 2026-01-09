import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';

import { Asistencia } from '../entities/asistencia.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { JornadaLaboral } from '../../usuario/entities/jornada-laboral.entity';

import {
  MarcarAsistenciaDto,
  CrearAsistenciaManualDto,
  AnularAsistenciaDto,
  AsistenciaResponseDto,
} from '../dto/asistencia.dto';

import { AsistenciaResumenDiarioDto } from '../dto/asistencia-resumen-diario.dto';
import { PermisoService } from '../../permiso/services/permiso.service';

type UsuarioAuth = {
  id_usuario: string;
  id_rol: 'ADMIN' | 'RRHH' | 'FUNCIONARIO' | string;
};

@Injectable()
export class AsistenciaService {
  constructor(
      @InjectRepository(Asistencia)
      private readonly asistenciaRepo: Repository<Asistencia>,

      @InjectRepository(Usuario)
      private readonly usuarioRepo: Repository<Usuario>,

      @InjectRepository(JornadaLaboral)
      private readonly jornadaRepo: Repository<JornadaLaboral>,

      private readonly permisoService: PermisoService,
  ) {}

  // ======================================================
  // HELPERS (Bolivia UTC-4 sin DST)
  // ======================================================
  private static readonly BO_OFFSET_MIN = -4 * 60; // -240

  private assertGestor(actor: UsuarioAuth) {
    if (!actor || (actor.id_rol !== 'ADMIN' && actor.id_rol !== 'RRHH')) {
      throw new ForbiddenException('No tiene permisos para esta acción');
    }
  }

  /**
   * Convierte un instante (Date) a “hora Bolivia” para formatear (ymd/hhmm).
   * OJO: Solo para formateo, no para comparar rangos.
   */
  private toBolivia(date: Date): Date {
    return new Date(date.getTime() + AsistenciaService.BO_OFFSET_MIN * 60_000);
  }

  private ymd(date: Date): string {
    return this.toBolivia(date).toISOString().slice(0, 10);
  }

  private hhmm(date: Date | null): string {
    if (!date) return '00:00';
    return this.toBolivia(date).toISOString().slice(11, 16);
  }

  /**
   * Retorna el instante UTC correspondiente a 00:00 Bolivia del día de `date`.
   * (00:00 BO == 04:00 UTC)
   */
  private startOfDayBO(date: Date): Date {
    const bo = this.toBolivia(date);
    const y = bo.getUTCFullYear();
    const m = bo.getUTCMonth();
    const d = bo.getUTCDate();
    // 00:00 Bolivia => 04:00 UTC
    return new Date(Date.UTC(y, m, d, 4, 0, 0, 0));
  }

  /**
   * Fin exclusivo del día Bolivia: start + 1 día
   */
  private endExclusiveOfDayBO(date: Date): Date {
    const start = this.startOfDayBO(date);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return end;
  }

  private async getMinutosObjetivo(id_usuario: string, fecha: Date): Promise<number> {
    // Día de semana según Bolivia
    const bo = this.toBolivia(fecha);
    const jsDay = bo.getUTCDay(); // 0..6
    const diaSemana = jsDay === 0 ? 7 : jsDay;

    const jornada = await this.jornadaRepo.findOne({
      where: { id_usuario, dia_semana: diaSemana as any, activo: true } as any,
    });

    return jornada?.minutos_objetivo ?? 0;
  }

  // ======================================================
  // MARCAR ASISTENCIA (ENTRADA / SALIDA)
  // Reglas:
  // - No 2 marcas consecutivas del mismo tipo
  // - No SALIDA sin ENTRADA
  // - Si ya existe una SALIDA hoy (BO), no se puede marcar nada más ese día
  // ======================================================
  async marcar(
      actor: UsuarioAuth,
      dto: MarcarAsistenciaDto,
      ip: string | null,
  ): Promise<AsistenciaResponseDto> {
    if (!actor?.id_usuario) throw new ForbiddenException('No autenticado');

    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: actor.id_usuario },
    });
    if (!usuario) throw new BadRequestException('El usuario no existe');

    const ahora = new Date();

    const permiso = await this.permisoService.tienePermisoAprobadoEnFecha(
        actor.id_usuario,
        ahora,
    );
    if (permiso.bloquea) {
      throw new BadRequestException(
          'No puede marcar asistencia: tiene permiso APROBADO para esta fecha',
      );
    }

    const startHoy = this.startOfDayBO(ahora);
    const endHoyEx = this.endExclusiveOfDayBO(ahora);

    // Si ya marcó SALIDA hoy → bloquear todo
    const yaSalio = await this.asistenciaRepo.exist({
      where: {
        id_usuario: actor.id_usuario,
        estado: 'VALIDA' as any,
        tipo: 'SALIDA' as any,
        fecha_hora: Between(startHoy, endHoyEx),
      } as any,
    });

    if (yaSalio) {
      throw new BadRequestException(
          'Ya registró SALIDA hoy. No puede registrar otra asistencia en esta fecha.',
      );
    }

    const ultima = await this.asistenciaRepo.findOne({
      where: {
        id_usuario: actor.id_usuario,
        estado: 'VALIDA' as any,
        fecha_hora: Between(startHoy, endHoyEx),
      } as any,
      order: { fecha_hora: 'DESC' as any },
    });

    if (ultima && ultima.tipo === dto.tipo) {
      throw new BadRequestException(`No puede registrar dos ${dto.tipo} consecutivos`);
    }

    if (dto.tipo === 'SALIDA' && !ultima) {
      throw new BadRequestException('Debe registrar una ENTRADA antes de la SALIDA');
    }

    const nuevo = this.asistenciaRepo.create({
      id_usuario: actor.id_usuario,
      fecha_hora: ahora,
      tipo: dto.tipo,
      estado: 'VALIDA',
      origen: dto.origen ?? 'web',
      ip_registro: ip,
      observacion: null,
      id_validador: null,
    } satisfies Partial<Asistencia>);

    const guardado = await this.asistenciaRepo.save(nuevo);

    const full = await this.asistenciaRepo.findOne({
      where: { id_asistencia: guardado.id_asistencia },
      relations: ['usuario', 'validador'],
    });

    if (!full) throw new NotFoundException('No se pudo recuperar la asistencia');

    return full as unknown as AsistenciaResponseDto;
  }

  async misAsistencias(actor: UsuarioAuth) {
    if (!actor?.id_usuario) throw new ForbiddenException('No autenticado');

    return this.asistenciaRepo.find({
      where: { id_usuario: actor.id_usuario } as any,
      relations: ['usuario', 'validador'],
      order: { fecha_hora: 'DESC' as any },
    });
  }

  async listarPorUsuario(actor: UsuarioAuth, id_usuario: string) {
    this.assertGestor(actor);

    return this.asistenciaRepo.find({
      where: { id_usuario } as any,
      relations: ['usuario', 'validador'],
      order: { fecha_hora: 'DESC' as any },
    });
  }

  // ======================================================
  // RESUMEN DIARIO (Bolivia)
  // ======================================================
  async resumenDiarioDeUsuario(
      actor: UsuarioAuth,
      idUsuario: string,
      from?: string,
      to?: string,
  ): Promise<AsistenciaResumenDiarioDto[]> {
    const esMismo = actor.id_usuario === idUsuario;
    const esGestor = actor.id_rol === 'ADMIN' || actor.id_rol === 'RRHH';
    if (!esMismo && !esGestor) throw new ForbiddenException('No autorizado');

    const now = new Date();
    const boNow = this.toBolivia(now);

    const start = from
        ? this.startOfDayBO(new Date(from))
        : this.startOfDayBO(new Date(Date.UTC(boNow.getUTCFullYear(), boNow.getUTCMonth(), 1)));

    const end = to
        ? this.startOfDayBO(new Date(to))
        : this.startOfDayBO(new Date(Date.UTC(boNow.getUTCFullYear(), boNow.getUTCMonth(), boNow.getUTCDate())));

    const endExclusive = new Date(end);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

    const asistencias = await this.asistenciaRepo.find({
      where: {
        id_usuario: idUsuario,
        estado: 'VALIDA' as any,
        fecha_hora: Between(start, endExclusive),
      } as any,
      order: { fecha_hora: 'ASC' as any },
    });

    const porDia = new Map<string, Asistencia[]>();
    for (const a of asistencias) {
      const key = this.ymd(a.fecha_hora);
      const list = porDia.get(key) ?? [];
      list.push(a);
      porDia.set(key, list);
    }

    const resultados: AsistenciaResumenDiarioDto[] = [];
    const cursor = new Date(start);

    while (cursor < endExclusive) {
      const key = this.ymd(cursor);
      const lista = porDia.get(key) ?? [];

      const boCursor = this.toBolivia(cursor);
      const jsDay = boCursor.getUTCDay(); // 0..6
      const esFDS = jsDay === 0 || jsDay === 6;

      const minutosObjetivo = await this.getMinutosObjetivo(idUsuario, cursor);

      const permiso = await this.permisoService.tienePermisoAprobadoEnFecha(idUsuario, cursor);

      let horaEntrada: Date | null = null;
      let horaSalida: Date | null = null;
      let minutosTrabajados = 0;
      let estado: AsistenciaResumenDiarioDto['estado'] = 'SIN_REGISTRO';

      if (permiso.bloquea) {
        estado = 'PERMISO';
      } else if (esFDS) {
        estado = 'FDS';
      } else if (lista.length > 0) {
        const entradas = lista.filter((a) => a.tipo === 'ENTRADA');
        const salidas = lista.filter((a) => a.tipo === 'SALIDA');

        entradas.sort((a, b) => a.fecha_hora.getTime() - b.fecha_hora.getTime());
        salidas.sort((a, b) => a.fecha_hora.getTime() - b.fecha_hora.getTime());

        horaEntrada = entradas[0]?.fecha_hora ?? null;
        horaSalida = salidas[salidas.length - 1]?.fecha_hora ?? null;

        if (horaEntrada && horaSalida) {
          minutosTrabajados = Math.max(
              Math.floor((horaSalida.getTime() - horaEntrada.getTime()) / 60000),
              0,
          );
          estado = 'OK';
        } else {
          estado = 'INCOMPLETO';
        }
      }

      resultados.push({
        fecha: key,
        horaEntrada: this.hhmm(horaEntrada),
        horaSalida: this.hhmm(horaSalida),
        minutosTrabajados,
        minutosObjetivo,
        estado,
      });

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return resultados;
  }

  async crearManual(actor: UsuarioAuth, dto: CrearAsistenciaManualDto) {
    this.assertGestor(actor);

    const usuario = await this.usuarioRepo.findOne({ where: { id_usuario: dto.id_usuario } });
    if (!usuario) throw new BadRequestException('El usuario no existe');

    const fecha = dto.fecha_hora ? new Date(dto.fecha_hora) : new Date();
    if (Number.isNaN(fecha.getTime())) throw new BadRequestException('fecha_hora inválida');

    const nuevo = this.asistenciaRepo.create({
      id_usuario: dto.id_usuario,
      fecha_hora: fecha,
      tipo: dto.tipo,
      estado: 'VALIDA',
      origen: dto.origen ?? 'manual',
      ip_registro: null,
      observacion: dto.observacion ?? 'Registro manual',
      id_validador: actor.id_usuario,
    } satisfies Partial<Asistencia>);

    const guardado = await this.asistenciaRepo.save(nuevo);

    const full = await this.asistenciaRepo.findOne({
      where: { id_asistencia: guardado.id_asistencia },
      relations: ['usuario', 'validador'],
    });

    if (!full) throw new NotFoundException('No se pudo recuperar la asistencia');

    return full as unknown as AsistenciaResponseDto;
  }

  async anular(actor: UsuarioAuth, id_asistencia: string, dto: AnularAsistenciaDto) {
    this.assertGestor(actor);

    const asistencia = await this.asistenciaRepo.findOne({ where: { id_asistencia } });
    if (!asistencia) throw new NotFoundException('Asistencia no encontrada');

    asistencia.estado = 'ANULADA';
    asistencia.observacion = dto.observacion ?? 'Anulada por RRHH/ADMIN';
    asistencia.id_validador = actor.id_usuario;

    await this.asistenciaRepo.save(asistencia);

    const full = await this.asistenciaRepo.findOne({
      where: { id_asistencia },
      relations: ['usuario', 'validador'],
    });

    return full as unknown as AsistenciaResponseDto;
  }
}