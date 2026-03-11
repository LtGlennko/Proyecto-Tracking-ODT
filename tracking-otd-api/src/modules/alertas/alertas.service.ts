import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from './alerta.entity';
import { AlertaAccion } from './alerta-accion.entity';
import { FilterAlertasDto } from './dto/filter-alertas.dto';
import { UpdateEstadoAlertaDto } from './dto/update-estado-alerta.dto';
import { CreateAccionDto } from './dto/create-accion.dto';

@Injectable()
export class AlertasService {
  constructor(
    @InjectRepository(Alerta) private alertaRepo: Repository<Alerta>,
    @InjectRepository(AlertaAccion) private accionRepo: Repository<AlertaAccion>,
  ) {}

  async findAll(filters: FilterAlertasDto) {
    const { page = 1, limit = 20, nivel, estadoAlerta, vinId } = filters;
    const qb = this.alertaRepo.createQueryBuilder('a').leftJoinAndSelect('a.hito', 'hito');
    if (nivel) qb.andWhere('a.nivel = :nivel', { nivel });
    if (estadoAlerta) qb.andWhere('a.estado_alerta = :estadoAlerta', { estadoAlerta });
    if (vinId) qb.andWhere('a.vin_id = :vinId', { vinId });
    const [items, total] = await qb.orderBy('a.fecha_generacion', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { _pagination: { items, total, page, limit } };
  }

  async findOne(id: number) {
    const alerta = await this.alertaRepo.findOne({ where: { id }, relations: ['hito', 'vin'] });
    if (!alerta) throw new NotFoundException(`Alerta ${id} no encontrada`);
    const acciones = await this.accionRepo.find({ where: { alertaId: id } });
    return { ...alerta, acciones };
  }

  async updateEstado(id: number, dto: UpdateEstadoAlertaDto): Promise<Alerta> {
    await this.findOne(id);
    await this.alertaRepo.update(id, { estadoAlerta: dto.estado });
    return this.alertaRepo.findOne({ where: { id } });
  }

  async createAccion(alertaId: number, dto: CreateAccionDto, usuarioId?: number): Promise<AlertaAccion> {
    await this.findOne(alertaId);
    return this.accionRepo.save(
      this.accionRepo.create({ alertaId, usuarioAccionId: usuarioId, accionTomada: dto.accionTomada, notas: dto.notas, fechaAccion: new Date() }),
    );
  }

  async detectarSlaVencidos(slaService: any): Promise<void> {
    const alertasActivas = await this.alertaRepo.find({ where: { estadoAlerta: 'activa' } });
    const alertasMap = new Map(alertasActivas.map(a => [`${a.vinId}-${a.hitoId}`, a]));

    // Logic called by scheduler — actual SLA check done via SlaService injected at scheduler level
  }
}
