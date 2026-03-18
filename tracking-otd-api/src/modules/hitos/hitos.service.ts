import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hito } from './hito.entity';
import { Subetapa } from './subetapa.entity';
import { GrupoParalelo } from './grupo-paralelo.entity';
import { HitoTipoVehiculo } from './hito-tipo-vehiculo.entity';
import { SubetapaTipoVehiculo } from './subetapa-tipo-vehiculo.entity';

@Injectable()
export class HitosService {
  constructor(
    @InjectRepository(Hito) private hitoRepo: Repository<Hito>,
    @InjectRepository(Subetapa) private subetapaRepo: Repository<Subetapa>,
    @InjectRepository(GrupoParalelo) private grupoRepo: Repository<GrupoParalelo>,
    @InjectRepository(HitoTipoVehiculo) private hitoTvRepo: Repository<HitoTipoVehiculo>,
    @InjectRepository(SubetapaTipoVehiculo) private subTvRepo: Repository<SubetapaTipoVehiculo>,
  ) {}

  // ── Master CRUD ──

  findAllHitos(): Promise<Hito[]> {
    return this.hitoRepo.find({
      relations: ['subetapas'],
      order: { orden: 'ASC', id: 'ASC' },
    });
  }

  async findOneHito(id: number): Promise<Hito> {
    const hito = await this.hitoRepo.findOne({
      where: { id },
      relations: ['subetapas'],
      order: { subetapas: { orden: 'ASC', id: 'ASC' } },
    });
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

  async deleteHito(id: number): Promise<void> {
    const hito = await this.hitoRepo.findOne({ where: { id }, relations: ['subetapas'] });
    if (!hito) throw new NotFoundException(`Hito ${id} no encontrado`);

    // Clean up per-vehicle-type configs for each subetapa
    for (const sub of hito.subetapas) {
      await this.subTvRepo.delete({ subetapaId: sub.id });
    }
    await this.hitoTvRepo.delete({ hitoId: id });

    // Delete subetapas then hito
    await this.subetapaRepo.delete({ hitoId: id });
    await this.hitoRepo.delete(id);
  }

  async deleteSubetapa(id: number): Promise<void> {
    const sub = await this.subetapaRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException(`Subetapa ${id} no encontrada`);

    // Clean up per-vehicle-type configs
    await this.subTvRepo.delete({ subetapaId: id });
    await this.subetapaRepo.delete(id);
  }

  // ── Grupos paralelos ──

  findGrupos(): Promise<GrupoParalelo[]> {
    return this.grupoRepo.find({ order: { id: 'ASC' } });
  }

  async createGrupo(dto: Partial<GrupoParalelo>): Promise<GrupoParalelo> {
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

  async deleteGrupoForTipo(id: number, tipoVehiculoId: number): Promise<void> {
    const grupo = await this.grupoRepo.findOne({ where: { id } });
    if (!grupo) throw new NotFoundException(`Grupo ${id} no encontrado`);

    const configsForTipo = await this.hitoTvRepo.find({ where: { tipoVehiculoId } });

    const grupoMinOrden = new Map<number, number>();
    for (const h of configsForTipo) {
      if (h.grupoParaleloId != null) {
        const cur = grupoMinOrden.get(h.grupoParaleloId);
        grupoMinOrden.set(h.grupoParaleloId, cur == null ? h.orden : Math.min(cur, h.orden));
      }
    }

    const grupoIdsInTipo = [...new Set(
      configsForTipo.filter(h => h.grupoParaleloId != null).map(h => h.grupoParaleloId),
    )];
    if (!grupoIdsInTipo.includes(id)) grupoIdsInTipo.push(id);

    const sorted = grupoIdsInTipo
      .map(gid => ({ id: gid, minOrden: grupoMinOrden.get(gid) ?? Infinity }))
      .sort((a, b) => a.minOrden - b.minOrden);

    const idx = sorted.findIndex(g => g.id === id);
    const prevGrupo = idx > 0 ? sorted[idx - 1] : null;

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

    const globalCount = await this.hitoTvRepo.count({ where: { grupoParaleloId: id } });
    if (globalCount === 0) {
      await this.grupoRepo.delete(id);
    }
  }

  // ── Config por tipo de vehículo ──

  async getConfigByTipoVehiculo(tipoVehiculoId: number) {
    const hitoConfigs = await this.hitoTvRepo.find({
      where: { tipoVehiculoId },
      relations: ['hito', 'hito.subetapas', 'grupoParalelo'],
      order: { orden: 'ASC' },
    });

    const subConfigs = await this.subTvRepo.find({
      where: { tipoVehiculoId },
      order: { orden: 'ASC' },
    });

    const subConfigMap = new Map(subConfigs.map(sc => [sc.subetapaId, sc]));

    const configuredHitoIds = new Set(hitoConfigs.map(hc => hc.hitoId));
    const allHitos = await this.hitoRepo.find({ relations: ['subetapas'], order: { orden: 'ASC', id: 'ASC' } });
    const unconfiguredHitos = allHitos.filter(h => !configuredHitoIds.has(h.id));

    if (unconfiguredHitos.length > 0) {
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
          tipoVehiculoId,
          hitoId: hito.id,
          orden: maxOrden,
          activo: true,
          grupoParaleloId: lastGrupoId,
          carril: hito.carril || 'financiero',
        }));

        const sortedSubs = [...(hito.subetapas || [])].sort((a, b) => (a.orden || 0) - (b.orden || 0) || a.id - b.id);
        for (let i = 0; i < sortedSubs.length; i++) {
          const sub = sortedSubs[i];
          await this.subTvRepo.save(this.subTvRepo.create({
            tipoVehiculoId,
            subetapaId: sub.id,
            orden: i + 1,
            activo: true,
          }));
        }
      }

      return this.getConfigByTipoVehiculo(tipoVehiculoId);
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
          campoStagingVin: sub.campoStagingVin,
          orden: sc?.orden ?? 0,
          activo: sc?.activo ?? true,
        };
      }).sort((a, b) => a.orden - b.orden),
    }));
  }

  async upsertHitoConfig(
    tipoVehiculoId: number,
    hitoId: number,
    dto: { orden?: number; activo?: boolean; grupoParaleloId?: number | null; carril?: string },
  ): Promise<HitoTipoVehiculo> {
    const config = await this.hitoTvRepo.findOne({ where: { tipoVehiculoId, hitoId } });
    if (config) {
      await this.hitoTvRepo.update(config.id, dto);
      return this.hitoTvRepo.findOne({ where: { id: config.id } });
    }
    return this.hitoTvRepo.save(this.hitoTvRepo.create({
      tipoVehiculoId, hitoId,
      orden: dto.orden ?? 0,
      activo: dto.activo ?? true,
      grupoParaleloId: dto.grupoParaleloId ?? null,
      carril: dto.carril ?? null,
    }));
  }

  async upsertSubetapaConfig(
    tipoVehiculoId: number,
    subetapaId: number,
    dto: { orden?: number; activo?: boolean },
  ): Promise<SubetapaTipoVehiculo> {
    const config = await this.subTvRepo.findOne({ where: { tipoVehiculoId, subetapaId } });
    if (config) {
      await this.subTvRepo.update(config.id, dto);
      return this.subTvRepo.findOne({ where: { id: config.id } });
    }
    return this.subTvRepo.save(this.subTvRepo.create({
      tipoVehiculoId, subetapaId,
      orden: dto.orden ?? 0,
      activo: dto.activo ?? true,
    }));
  }

  // ── Reset config por tipo de vehículo ──

  async resetConfigForTipo(tipoVehiculoId: number): Promise<void> {
    await this.subTvRepo.delete({ tipoVehiculoId });
    await this.hitoTvRepo.delete({ tipoVehiculoId });

    // Limpiar grupos paralelos huérfanos (sin hitos asociados en ningún tipo)
    const allGrupos = await this.grupoRepo.find();
    for (const g of allGrupos) {
      const count = await this.hitoTvRepo.count({ where: { grupoParaleloId: g.id } });
      if (count === 0) {
        await this.grupoRepo.delete(g.id);
      }
    }
  }

}
