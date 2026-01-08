import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import { Asistencia } from '../entities/asistencia.entity';
import {
  CrearAsistenciaDto,
  ActualizarAsistenciaDto,
  AsistenciaResponseDto,
} from '../dto/asistencia.dto';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { AsistenciaResumenDiarioDto } from '../dto/asistencia-resumen-diario.dto';

@Injectable()
export class AsistenciaService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistenciaRepo: Repository<Asistencia>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // =========================================================
  // CREAR ASISTENCIA
  // =========================================================
  async crear(dto: CrearAsistenciaDto): Promise<AsistenciaResponseDto> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: dto.id_usuario },
    });

    if (!usuario) {
      throw new BadRequestException('El usuario no existe.');
    }

    // Verificar reglas del día
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const ultima = await this.asistenciaRepo.findOne({
      where: {
        id_usuario: dto.id_usuario,
        estado: 'VALIDA',
        fecha_hora: MoreThan(hoy),
      },
      order: { fecha_hora: 'DESC' },
    });

    // Regla: no permitir dos marcaciones iguales seguidas
    if (ultima && ultima.tipo === dto.tipo) {
      throw new BadRequestException(
        `No puede registrar dos asistencias consecutivas de tipo "${dto.tipo}".`,
      );
    }

    // Regla: no permitir SALIDA sin ENTRADA previa
    if (dto.tipo === 'salida' && !ultima) {
      throw new BadRequestException(
        'Debe registrar una entrada antes de registrar salida.',
      );
    }

    // Crear registro
    const nuevo = this.asistenciaRepo.create({
      ...dto,
      fecha_hora: new Date(),
      estado: 'VALIDA',
    });

    const guardado = await this.asistenciaRepo.save(nuevo);

    // Retornar DTO con relaciones
    const asistencia = await this.asistenciaRepo.findOne({
      where: { id_asistencia: guardado.id_asistencia },
      relations: ['usuario', 'validador'],
    });

    return asistencia as AsistenciaResponseDto;
  }

  // =========================================================
  // LISTAR
  // =========================================================
  async listar(): Promise<AsistenciaResponseDto[]> {
    const asistencias = await this.asistenciaRepo.find({
      relations: ['usuario', 'validador'],
      order: { fecha_hora: 'DESC' },
    });

    return asistencias as AsistenciaResponseDto[];
  }

  // =========================================================
  // ACTUALIZAR (VALIDAR / INVALIDAR / ANULAR)
  // =========================================================
  async actualizar(
    id: string,
    dto: ActualizarAsistenciaDto,
  ): Promise<AsistenciaResponseDto> {
    const asistencia = await this.asistenciaRepo.findOne({
      where: { id_asistencia: id },
    });

    if (!asistencia) {
      throw new NotFoundException('La asistencia no existe.');
    }

    // Solo RRHH/ADMIN pueden modificar estado o asignar validador
    if (dto.estado) {
      asistencia.estado = dto.estado;
    }

    if (dto.id_validador) {
      const validador = await this.usuarioRepo.findOne({
        where: { id_usuario: dto.id_validador },
      });

      if (!validador) {
        throw new BadRequestException('El validador no existe.');
      }

      asistencia.id_validador = dto.id_validador;
    }

    await this.asistenciaRepo.save(asistencia);

    // Retornar con relaciones completas
    const actualizado = await this.asistenciaRepo.findOne({
      where: { id_asistencia: id },
      relations: ['usuario', 'validador'],
    });

    return actualizado as AsistenciaResponseDto;
  }

  // =========================================
  // LISTAR ASISTENCIAS DE UN USUARIO
  // =========================================
  async listarPorUsuario(id_usuario: string) {
    return this.asistenciaRepo.find({
      where: { id_usuario },
      relations: ['usuario', 'validador'],
      order: { fecha_hora: 'DESC' },
    });
  }

  async resumenDiarioUsuario(
    idUsuario: string,
    from?: string,
    to?: string,
  ): Promise<AsistenciaResumenDiarioDto[]> {
    // Rango por defecto: del 1 al día actual del mes en curso
    const hoy = new Date();
    const start = from
      ? new Date(from)
      : new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const end = to
      ? new Date(to)
      : new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    // Traemos todas las asistencias válidas del usuario en el rango
    const asistencias = await this.asistenciaRepo.find({
      where: {
        id_usuario: idUsuario,
        estado: 'VALIDA',
        fecha_hora: Between(start, end),
      },
      order: { fecha_hora: 'ASC' },
    });

    // Agrupar por día YYYY-MM-DD
    const porDia = new Map<string, Asistencia[]>();

    for (const a of asistencias) {
      const key = a.fecha_hora.toISOString().slice(0, 10); // YYYY-MM-DD
      const list = porDia.get(key) ?? [];
      list.push(a);
      porDia.set(key, list);
    }

    // Helper para formato hh:mm
    const formatHora = (d: Date | null): string =>
      d
        ? d.toISOString().slice(11, 16) // HH:MM
        : '00:00';

    const resultados: AsistenciaResumenDiarioDto[] = [];

    // Recorremos día por día
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      const lista = porDia.get(key) ?? [];

      // Por ahora, asumimos break fijo de 45 minutos cuando hay entrada/salida
      const minutosBreak = lista.length > 0 ? 45 : 0;

      let horaEntrada: Date | null = null;
      let horaSalida: Date | null = null;
      let minutosTrabajados = 0;
      let estado: 'OK' | 'SIN_REGISTRO' | 'PERMISO' | 'FDS' = 'SIN_REGISTRO';

      if (lista.length > 0) {
        // entrada = primer registro tipo 'entrada'
        const entradas = lista
          .filter((a) => a.tipo === 'entrada')
          .sort((a, b) => a.fecha_hora.getTime() - b.fecha_hora.getTime());

        // salida = último registro tipo 'salida'
        const salidas = lista
          .filter((a) => a.tipo === 'salida')
          .sort((a, b) => a.fecha_hora.getTime() - b.fecha_hora.getTime());

        horaEntrada = entradas[0]?.fecha_hora ?? null;
        horaSalida = salidas[salidas.length - 1]?.fecha_hora ?? null;

        if (horaEntrada && horaSalida) {
          const diffMs = horaSalida.getTime() - horaEntrada.getTime();
          const diffMin = Math.max(
            Math.floor(diffMs / 60000) - minutosBreak,
            0,
          );
          minutosTrabajados = diffMin;
          estado = 'OK';
        } else {
          // registros raros (solo entrada o solo salida)
          estado = 'SIN_REGISTRO';
        }
      } else {
        // Aquí más adelante podemos cruzar con permisos para marcar "PERMISO"
        // o con fines de semana para marcar "FDS"
        estado = 'SIN_REGISTRO';
      }

      resultados.push({
        fecha: key,
        horaEntrada: formatHora(horaEntrada),
        horaSalida: formatHora(horaSalida),
        minutosBreak,
        minutosTrabajados,
        estado,
      });

      // siguiente día
      cursor.setDate(cursor.getDate() + 1);
    }

    return resultados;
  }
}
