import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hito } from './hito.entity';
import { Subetapa } from './subetapa.entity';
import { GrupoParalelo } from './grupo-paralelo.entity';
import { SubetapaConfig } from './subetapa-config.entity';
import { HitoTipoVehiculo } from './hito-tipo-vehiculo.entity';
import { SubetapaTipoVehiculo } from './subetapa-tipo-vehiculo.entity';

@Injectable()
export class HitosService {
  constructor(
    @InjectRepository(Hito) private hitoRepo: Repository<Hito>,
    @InjectRepository(Subetapa) private subetapaRepo: Repository<Subetapa>,
    @InjectRepository(GrupoParalelo) private grupoRepo: Repository<GrupoParalelo>,
    @InjectRepository(SubetapaConfig) private configRepo: Repository<SubetapaConfig>,
    @InjectRepository(HitoTipoVehiculo) private hitoTvRepo: Repository<HitoTipoVehiculo>,
    @InjectRepository(SubetapaTipoVehiculo) private subTvRepo: Repository<SubetapaTipoVehiculo>,
  ) {}

  // ── Master CRUD ──

  findAllHitos(): Promise<Hito[]> {
    return this.hitoRepo.find({ relations: ['subetapas'], order: { id: 'ASC' } });
  }

  async findOneHito(id: number): Promise<Hito> {
    const hito = await this.hitoRepo.findOne({ where: { id }, relations: ['subetapas'] });
    if (!hito) throw new NotFoundException(`Hito ${id} no encontrado`);
    return hito;
  }

  createHito(dto: Partial<Hito>): Promise<Hito> {
    return this.hitoRepo.save(this.hitoRepo.create(dto));
  }

  async updateHito(id: number, dto: Partial<Hito>): Promise<Hito> {
    await this.findOneHito(id);
    await this.hitoRepo.update(id, dto);
    return this.findOneHito(id);
  }

  createSubetapa(hitoId: number, dto: Partial<Subetapa>): Promise<Subetapa> {
    return this.subetapaRepo.save(this.subetapaRepo.create({ ...dto, hitoId }));
  }

  async updateSubetapa(id: number, dto: Partial<Subetapa>): Promise<Subetapa> {
    const sub = await this.subetapaRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException(`Subetapa ${id} no encontrada`);
    await this.subetapaRepo.update(id, dto);
    return this.subetapaRepo.findOne({ where: { id } });
  }

  // ── Grupos paralelos ──

  findGrupos(): Promise<GrupoParalelo[]> {
    return this.grupoRepo.find({ order: { id: 'ASC' } });
  }

  createGrupo(dto: Partial<GrupoParalelo>): Promise<GrupoParalelo> {
    return this.grupoRepo.save(this.grupoRepo.create(dto));
  }

  async updateGrupo(id: number, dto: Partial<GrupoParalelo>): Promise<GrupoParalelo> {
    await this.grupoRepo.update(id, dto);
    return this.grupoRepo.findOne({ where: { id } });
  }

  // ── Config por tipo de vehículo ──

  async getConfigByTipoVehiculo(tipoVehiculo: string) {
    const hitoConfigs = await this.hitoTvRepo.find({
      where: { tipoVehiculo },
      relations: ['hito', 'hito.subetapas', 'grupoParalelo'],
      order: { orden: 'ASC' },
    });

    const subConfigs = await this.subTvRepo.find({
      where: { tipoVehiculo },
      order: { orden: 'ASC' },
    });

    const subConfigMap = new Map(subConfigs.map(sc => [sc.subetapaId, sc]));

    return hitoConfigs.map(hc => ({
      hitoConfigId: hc.id,
      hitoId: hc.hitoId,
      nombre: hc.hito.nombre,
      carril: hc.hito.carril,
      grupoParalelo: hc.grupoParalelo ? { id: hc.grupoParalelo.id, nombre: hc.grupoParalelo.nombre } : null,
      orden: hc.orden,
      activo: hc.activo,
      subetapas: (hc.hito.subetapas || []).map(sub => {
        const sc = subConfigMap.get(sub.id);
        return {
          subetapaConfigId: sc?.id ?? null,
          subetapaId: sub.id,
          nombre: sub.nombre,
          categoria: sub.categoria,
          campoStagingVin: sub.campoStagingVin,
          orden: sc?.orden ?? 0,
          activo: sc?.activo ?? true,
        };
      }).sort((a, b) => a.orden - b.orden),
    }));
  }

  async upsertHitoConfig(
    tipoVehiculo: string,
    hitoId: number,
    dto: { orden?: number; activo?: boolean; grupoParaleloId?: number | null },
  ): Promise<HitoTipoVehiculo> {
    const config = await this.hitoTvRepo.findOne({ where: { tipoVehiculo, hitoId } });
    if (config) {
      await this.hitoTvRepo.update(config.id, dto);
      return this.hitoTvRepo.findOne({ where: { id: config.id } });
    }
    return this.hitoTvRepo.save(this.hitoTvRepo.create({
      tipoVehiculo, hitoId,
      orden: dto.orden ?? 0,
      activo: dto.activo ?? true,
      grupoParaleloId: dto.grupoParaleloId ?? null,
    }));
  }

  async upsertSubetapaConfig(
    tipoVehiculo: string,
    subetapaId: number,
    dto: { orden?: number; activo?: boolean },
  ): Promise<SubetapaTipoVehiculo> {
    const config = await this.subTvRepo.findOne({ where: { tipoVehiculo, subetapaId } });
    if (config) {
      await this.subTvRepo.update(config.id, dto);
      return this.subTvRepo.findOne({ where: { id: config.id } });
    }
    return this.subTvRepo.save(this.subTvRepo.create({
      tipoVehiculo, subetapaId,
      orden: dto.orden ?? 0,
      activo: dto.activo ?? true,
    }));
  }

  // ── Legacy SubetapaConfig ──

  addSubetapaConfig(subetapaId: number, dto: Partial<SubetapaConfig>): Promise<SubetapaConfig> {
    return this.configRepo.save(this.configRepo.create({ ...dto, subetapaId }));
  }

  async removeSubetapaConfig(configId: number): Promise<void> {
    await this.configRepo.delete(configId);
  }
}
