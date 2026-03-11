import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlaConfig } from './sla-config.entity';
import { CreateSlaDto } from './dto/create-sla.dto';
import { ResolveSlaDto } from './dto/resolve-sla.dto';

@Injectable()
export class SlaService {
  constructor(
    @InjectRepository(SlaConfig)
    private repo: Repository<SlaConfig>,
  ) {}

  async findAll(filters: { empresaId?: number; subetapaId?: number; lineaNegocio?: string }) {
    const qb = this.repo.createQueryBuilder('s').leftJoinAndSelect('s.empresa', 'empresa').leftJoinAndSelect('s.subetapa', 'subetapa');
    if (filters.empresaId) qb.andWhere('s.empresa_id = :empresaId', { empresaId: filters.empresaId });
    if (filters.subetapaId) qb.andWhere('s.subetapa_id = :subetapaId', { subetapaId: filters.subetapaId });
    if (filters.lineaNegocio) qb.andWhere('s.linea_negocio = :lineaNegocio', { lineaNegocio: filters.lineaNegocio });
    const items = await qb.getMany();
    return items.map(i => ({ ...i, diasCritico: (i.diasObjetivo || 0) + (i.diasTolerancia || 0) }));
  }

  async findOne(id: number) {
    const sla = await this.repo.findOne({ where: { id }, relations: ['empresa', 'subetapa'] });
    if (!sla) throw new NotFoundException(`Regla SLA ${id} no encontrada`);
    return { ...sla, diasCritico: (sla.diasObjetivo || 0) + (sla.diasTolerancia || 0) };
  }

  create(dto: CreateSlaDto): Promise<SlaConfig> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<CreateSlaDto>): Promise<SlaConfig> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async resolve(ctx: ResolveSlaDto) {
    const all = await this.repo.find();
    const candidates = all.filter(s => {
      if (ctx.empresaId && s.empresaId && s.empresaId !== ctx.empresaId) return false;
      if (ctx.subetapaId && s.subetapaId && s.subetapaId !== ctx.subetapaId) return false;
      if (ctx.lineaNegocio && s.lineaNegocio && s.lineaNegocio !== ctx.lineaNegocio) return false;
      if (ctx.tipoVehiculo && s.tipoVehiculo && s.tipoVehiculo !== ctx.tipoVehiculo) return false;
      return true;
    });

    if (candidates.length === 0) return null;

    const score = (s: SlaConfig) =>
      [s.empresaId, s.subetapaId, s.lineaNegocio, s.tipoVehiculo].filter(Boolean).length;

    const best = candidates.reduce((a, b) => (score(a) >= score(b) ? a : b));
    return { ...best, diasCritico: (best.diasObjetivo || 0) + (best.diasTolerancia || 0) };
  }

  getStatus(dias: number, sla: { diasObjetivo: number; diasTolerancia: number }): 'ok' | 'warning' | 'critico' {
    const diasCritico = sla.diasObjetivo + sla.diasTolerancia;
    if (dias <= sla.diasObjetivo) return 'ok';
    if (dias <= diasCritico) return 'warning';
    return 'critico';
  }
}
