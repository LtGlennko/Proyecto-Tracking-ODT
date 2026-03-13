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

  async createGrupo(dto: Partial<GrupoParalelo>): Promise<GrupoParalelo> {
    // Only one empty grupo allowed — delete grupos with zero references across ALL vehicle types
    const allGrupos = await this.grupoRepo.find({ order: { id: 'ASC' } });
    for (const g of allGrupos) {
      const globalCount = await this.hitoTvRepo.count({ where: { grupoParaleloId: g.id } });
      if (globalCount === 0) {
        await this.grupoRepo.delete(g.id);
      }
    }
    return this.grupoRepo.save(this.grupoRepo.create(dto));
  }

  async updateGrupo(id: number, dto: Partial<GrupoParalelo>): Promise<GrupoParalelo> {
    await this.grupoRepo.update(id, dto);
    return this.grupoRepo.findOne({ where: { id } });
  }

  async deleteGrupoForTipo(id: number, tipoVehiculo: string): Promise<void> {
    const grupo = await this.grupoRepo.findOne({ where: { id } });
    if (!grupo) throw new NotFoundException(`Grupo ${id} no encontrado`);

    // Only work with hito configs for THIS vehicle type
    const configsForTipo = await this.hitoTvRepo.find({ where: { tipoVehiculo } });

    // Determine visual order of grupos within this vehicle type by minOrden
    const grupoMinOrden = new Map<number, number>();
    for (const h of configsForTipo) {
      if (h.grupoParaleloId != null) {
        const cur = grupoMinOrden.get(h.grupoParaleloId);
        grupoMinOrden.set(h.grupoParaleloId, cur == null ? h.orden : Math.min(cur, h.orden));
      }
    }

    // Sort grupos by visual position for this vehicle type
    const grupoIdsInTipo = [...new Set(
      configsForTipo.filter(h => h.grupoParaleloId != null).map(h => h.grupoParaleloId),
    )];
    // Include the target grupo even if it has no hitos in this tipo
    if (!grupoIdsInTipo.includes(id)) grupoIdsInTipo.push(id);

    const sorted = grupoIdsInTipo
      .map(gid => ({ id: gid, minOrden: grupoMinOrden.get(gid) ?? Infinity }))
      .sort((a, b) => a.minOrden - b.minOrden);

    const idx = sorted.findIndex(g => g.id === id);
    const prevGrupo = idx > 0 ? sorted[idx - 1] : null;

    // Reassign only THIS vehicle type's hitos from the deleted grupo
    const hitosInGrupo = configsForTipo
      .filter(h => h.grupoParaleloId === id)
      .sort((a, b) => a.orden - b.orden);

    if (hitosInGrupo.length > 0 && prevGrupo) {
      const hitosInPrev = configsForTipo.filter(h => h.grupoParaleloId === prevGrupo.id);
      let maxOrden = hitosInPrev.length > 0
        ? Math.max(...hitosInPrev.map(h => h.orden))
        : 0;

      for (const h of hitosInGrupo) {
        maxOrden++;
        await this.hitoTvRepo.update(h.id, { grupoParaleloId: prevGrupo.id, orden: maxOrden });
      }
    } else if (hitosInGrupo.length > 0 && !prevGrupo) {
      for (const h of hitosInGrupo) {
        await this.hitoTvRepo.update(h.id, { grupoParaleloId: null });
      }
    }

    // Only delete the grupo_paralelo record if NO other vehicle type references it
    const globalCount = await this.hitoTvRepo.count({ where: { grupoParaleloId: id } });
    if (globalCount === 0) {
      await this.grupoRepo.delete(id);
    }
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

    // Find hitos without config for this vehicle type and add them with defaults
    const configuredHitoIds = new Set(hitoConfigs.map(hc => hc.hitoId));
    const allHitos = await this.hitoRepo.find({ relations: ['subetapas'], order: { id: 'ASC' } });
    const unconfiguredHitos = allHitos.filter(h => !configuredHitoIds.has(h.id));

    if (unconfiguredHitos.length > 0) {
      // Determine last grupo — create one if none exists
      let lastGrupoId: number | null = null;
      const withGrupo = hitoConfigs.filter(hc => hc.grupoParaleloId != null);
      if (withGrupo.length > 0) {
        lastGrupoId = withGrupo.reduce((best, hc) =>
          hc.orden > best.orden ? hc : best
        ).grupoParaleloId;
      } else {
        const newGrupo = await this.grupoRepo.save(this.grupoRepo.create({}));
        lastGrupoId = newGrupo.id;
      }

      let maxOrden = hitoConfigs.length > 0
        ? Math.max(...hitoConfigs.map(hc => hc.orden))
        : 0;

      for (const hito of unconfiguredHitos) {
        maxOrden++;
        await this.hitoTvRepo.save(this.hitoTvRepo.create({
          tipoVehiculo,
          hitoId: hito.id,
          orden: maxOrden,
          activo: true,
          grupoParaleloId: lastGrupoId,
          carril: 'financiero',
        }));

        // Also create default subetapa configs
        for (let i = 0; i < (hito.subetapas || []).length; i++) {
          const sub = hito.subetapas[i];
          await this.subTvRepo.save(this.subTvRepo.create({
            tipoVehiculo,
            subetapaId: sub.id,
            orden: i + 1,
            activo: true,
          }));
        }
      }

      // Re-fetch with the newly created configs
      return this.getConfigByTipoVehiculo(tipoVehiculo);
    }

    return hitoConfigs.map(hc => ({
      hitoConfigId: hc.id,
      hitoId: hc.hitoId,
      nombre: hc.hito.nombre,
      carril: hc.carril ?? hc.hito.carril,
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
    dto: { orden?: number; activo?: boolean; grupoParaleloId?: number | null; carril?: string },
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
      carril: dto.carril ?? null,
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
