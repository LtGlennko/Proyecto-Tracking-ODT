import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

// GAP manual subetapa names — never sync from staging
const GAP_MANUALES = ['Solicitud crédito', 'Aprobación', 'Pago Confirmado', 'Unidad Lista', 'Cita Agendada'];

// Hito DB id → frontend string id
const HITO_SLUG: Record<number, string> = {
  1: 'importacion', 2: 'asignacion', 3: 'pdi', 4: 'credito',
  5: 'facturacion', 6: 'pago', 7: 'inmatriculacion', 8: 'programacion', 9: 'entrega',
};

const HITO_LABELS: Record<string, string> = {
  importacion: 'Importación', asignacion: 'Asignación', pdi: 'PDI',
  credito: 'Crédito', facturacion: 'Facturación', pago: 'Pago',
  inmatriculacion: 'Inmatriculación', programacion: 'Programación', entrega: 'Entrega',
};

/** Format a Date to ISO date string, or empty string */
function fmtDate(d: Date | null | undefined): string {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

/** Add days to a YYYY-MM-DD date string */
function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

interface SlaRow {
  empresaId: number | null;
  subetapaId: number | null;
  tipoVehiculoId: number | null;
  diasObjetivo: number;
  diasTolerancia: number;
}

interface HierarchyFilters {
  empresaId?: number;
  estado?: string;
  tipoVehiculoId?: number;
  busqueda?: string;
}

interface HitoConfig {
  hitoId: number;
  grupoParaleloId: number | null;
  carril: string | null;
  orden: number;
  activo: boolean;
  icono: string | null;
}

interface SubConfig {
  subetapaId: number;
  orden: number;
  activo: boolean;
}

interface SubetapaDef {
  id: number;
  hitoId: number;
  nombre: string;
  campoStagingReal: string | null;
  campoStagingPlan: string | null;
}

@Injectable()
export class TrackingService {
  constructor(
    private dataSource: DataSource,
  ) {}

  calcularDiferenciaDias(fechaPlan: Date, fechaReal: Date): number | null {
    if (!fechaPlan || !fechaReal) return null;
    return Math.ceil((new Date(fechaReal).getTime() - new Date(fechaPlan).getTime()) / 86400000);
  }

  // ── Hierarchical endpoint: Cliente → Ficha → VIN ──

  async getClientesHierarchy(filters: HierarchyFilters) {
    // 1. Load all VINs with their ficha, cliente, empresa, tipo_vehiculo
    const qb = this.dataSource.createQueryBuilder()
      .select('v.id', 'vinId')
      .addSelect('sv.modelo_comercial', 'modelo')
      .addSelect('v.marca', 'marca')
      .addSelect('v.tipo_vehiculo_id', 'tipoVehiculoId')
      .addSelect('tv.nombre', 'tipoVehiculoNombre')
      .addSelect('tv.slug', 'tipoVehiculoSlug')
      .addSelect('tv.color', 'tipoVehiculoColor')
      .addSelect('sv.lote_asignado', 'lote')
      .addSelect('sv.pedido_interno', 'ordenCompra')
      .addSelect('v.ultima_actualizacion', 'ultimaActualizacion')
      .addSelect('f.id', 'fichaDbId')
      .addSelect('f.codigo', 'fichaCodigo')
      .addSelect('sv.descripcion_cond_pago', 'formaPago')
      .addSelect('f.fecha_creacion', 'fechaCreacion')
      .addSelect('COALESCE(sv.nombre_vendedor, f.ejecutivo)', 'ejecutivo')
      .addSelect('c.id', 'clienteDbId')
      .addSelect('c.nombre', 'clienteNombre')
      .addSelect('c.is_vic', 'isVic')
      .addSelect('e.id', 'empresaDbId')
      .addSelect('e.nombre', 'empresaNombre')
      .from('vin', 'v')
      .leftJoin('tipo_vehiculo', 'tv', 'tv.id = v.tipo_vehiculo_id')
      .leftJoin('staging_vin', 'sv', 'sv.vin = v.id')
      .leftJoin('ficha', 'f', 'v.ficha_id = f.id')
      .leftJoin('cliente', 'c', 'f.cliente_id = c.id')
      .leftJoin('empresa', 'e', 'c.empresa_id = e.id');

    if (filters.empresaId) {
      qb.andWhere('e.id = :empresaId', { empresaId: filters.empresaId });
    }
    if (filters.tipoVehiculoId) {
      qb.andWhere('v.tipo_vehiculo_id = :tipoVehiculoId', { tipoVehiculoId: filters.tipoVehiculoId });
    }
    if (filters.busqueda) {
      qb.andWhere(
        '(v.id ILIKE :q OR c.nombre ILIKE :q OR sv.modelo_comercial ILIKE :q OR f.codigo ILIKE :q)',
        { q: `%${filters.busqueda}%` },
      );
    }

    qb.orderBy('c.nombre', 'ASC').addOrderBy('f.codigo', 'ASC').addOrderBy('v.id', 'ASC');

    const rows: any[] = await qb.getRawMany();

    const vinIds = rows.map(r => r.vinId);
    if (vinIds.length === 0) return [];

    // 2. Load hito_tipo_vehiculo config (per tipo_vehiculo_id)
    const hitoConfigRows: any[] = await this.dataSource.createQueryBuilder()
      .select('htv.hito_id', 'hitoId')
      .addSelect('htv.tipo_vehiculo_id', 'tipoVehiculoId')
      .addSelect('htv.grupo_paralelo_id', 'grupoParaleloId')
      .addSelect('htv.carril', 'carril')
      .addSelect('htv.orden', 'orden')
      .addSelect('htv.activo', 'activo')
      .addSelect('h.icono', 'icono')
      .from('hito_tipo_vehiculo', 'htv')
      .leftJoin('hito', 'h', 'h.id = htv.hito_id')
      .orderBy('htv.orden', 'ASC')
      .getRawMany();

    // Map: tipoVehiculoId → HitoConfig[]
    const hitoConfigByTipo = new Map<number, HitoConfig[]>();
    for (const r of hitoConfigRows) {
      const key = r.tipoVehiculoId as number;
      if (!hitoConfigByTipo.has(key)) hitoConfigByTipo.set(key, []);
      hitoConfigByTipo.get(key)!.push({
        hitoId: r.hitoId,
        grupoParaleloId: r.grupoParaleloId,
        carril: r.carril,
        orden: r.orden,
        activo: r.activo,
        icono: r.icono || null,
      });
    }

    // 5. Load subetapa_tipo_vehiculo config (per tipo_vehiculo_id)
    const subConfigRows: any[] = await this.dataSource.createQueryBuilder()
      .select('stv.subetapa_id', 'subetapaId')
      .addSelect('stv.tipo_vehiculo_id', 'tipoVehiculoId')
      .addSelect('stv.orden', 'orden')
      .addSelect('stv.activo', 'activo')
      .from('subetapa_tipo_vehiculo', 'stv')
      .orderBy('stv.orden', 'ASC')
      .getRawMany();

    // Map: tipoVehiculoId → SubConfig[]
    const subConfigByTipo = new Map<number, SubConfig[]>();
    for (const r of subConfigRows) {
      const key = r.tipoVehiculoId as number;
      if (!subConfigByTipo.has(key)) subConfigByTipo.set(key, []);
      subConfigByTipo.get(key)!.push({
        subetapaId: r.subetapaId,
        orden: r.orden,
        activo: r.activo,
      });
    }

    // 6. Load all subetapa definitions (for campo_staging_real/plan lookup)
    const allSubetapas: any[] = await this.dataSource.createQueryBuilder()
      .select('s.id', 'id')
      .addSelect('s.hito_id', 'hitoId')
      .addSelect('s.nombre', 'nombre')
      .addSelect('s.campo_staging_real', 'campoStagingReal')
      .addSelect('s.campo_staging_plan', 'campoStagingPlan')
      .from('subetapa', 's')
      .getRawMany();

    const subetapaById = new Map<number, SubetapaDef>();
    for (const s of allSubetapas) {
      subetapaById.set(s.id, {
        id: s.id,
        hitoId: s.hitoId,
        nombre: s.nombre,
        campoStagingReal: s.campoStagingReal,
        campoStagingPlan: s.campoStagingPlan,
      });
    }

    // 6b. Load all SLA configs (for baseline/plan computation)
    const slaConfigs: SlaRow[] = await this.dataSource.createQueryBuilder()
      .select('s.empresa_id', 'empresaId')
      .addSelect('s.subetapa_id', 'subetapaId')
      .addSelect('s.tipo_vehiculo_id', 'tipoVehiculoId')
      .addSelect('s.dias_objetivo', 'diasObjetivo')
      .addSelect('s.dias_tolerancia', 'diasTolerancia')
      .from('sla_config', 's')
      .getRawMany();

    // 7. Load full staging_vin rows for date resolution via campo_staging_vin
    const stagingRows: any[] = await this.dataSource.createQueryBuilder()
      .select('sv.*')
      .from('staging_vin', 'sv')
      .where('sv.vin IN (:...vinIds)', { vinIds })
      .getRawMany();

    const stagingByVin = new Map<string, any>();
    for (const sv of stagingRows) {
      stagingByVin.set(sv.vin, sv);
    }

    // 8. Build hierarchical structure
    const clienteMap = new Map<number, any>();

    for (const row of rows) {
      const tvId = row.tipoVehiculoId as number;
      const hitoConfig = hitoConfigByTipo.get(tvId);
      const subConfig = subConfigByTipo.get(tvId);
      const stagingRow = stagingByVin.get(row.vinId);

      const stages = this.buildStages(hitoConfig, subConfig, subetapaById, stagingRow, slaConfigs, tvId, row.empresaDbId);

      // Derive estado from actual stage statuses (not from stored values)
      const estadoGeneral = this.deriveEstadoGeneral(stages);

      if (filters.estado && estadoGeneral !== filters.estado) continue;

      const currentStageId = this.deriveCurrentStage(stages);
      const cumplimiento = this.deriveCumplimiento(stages);

      const vinObj = {
        id: row.vinId,
        fichaId: row.fichaCodigo,
        clientName: row.clienteNombre,
        tipoVehiculo: {
          id: tvId,
          nombre: row.tipoVehiculoNombre,
          slug: row.tipoVehiculoSlug,
          color: row.tipoVehiculoColor,
        },
        modelo: row.modelo,
        lote: row.lote || '',
        ordenCompra: row.ordenCompra || '',
        estadoGeneral,
        currentStageId,
        lastUpdate: row.ultimaActualizacion ? new Date(row.ultimaActualizacion).toISOString() : '',
        daysDelayed: 0, // Without SLA there's no delay calculation
        diasVendedorComercial: 0,
        cumplimiento,
        stages,
      };

      if (!clienteMap.has(row.clienteDbId)) {
        clienteMap.set(row.clienteDbId, {
          id: String(row.clienteDbId),
          name: row.clienteNombre,
          empresa: row.empresaNombre,
          isVic: row.isVic || false,
          _fichaMap: new Map<number, any>(),
        });
      }
      const client = clienteMap.get(row.clienteDbId);

      if (!client._fichaMap.has(row.fichaDbId)) {
        client._fichaMap.set(row.fichaDbId, {
          id: row.fichaCodigo,
          clientId: String(row.clienteDbId),
          clientName: row.clienteNombre,
          dateCreated: row.fechaCreacion ? new Date(row.fechaCreacion).toISOString().slice(0, 10) : '',
          executive: row.ejecutivo || '',
          formasPago: new Set<string>(),
          vins: [],
        });
      }
      const ficha = client._fichaMap.get(row.fichaDbId);
      if (row.formaPago) ficha.formasPago.add(row.formaPago);
      ficha.vins.push(vinObj);
    }

    // 10. Convert maps to arrays (Set → array for formasPago)
    const result: any[] = [];
    for (const client of clienteMap.values()) {
      const fichas = Array.from(client._fichaMap.values()).map((f: any) => {
        f.formasPago = Array.from(f.formasPago);
        return f;
      });
      delete client._fichaMap;
      client.fichas = fichas;
      result.push(client);
    }

    return result;
  }

  /** Derive estadoGeneral from built stages (not from stored tracking values) */
  private deriveEstadoGeneral(stages: any[]): string {
    if (!stages || stages.length === 0) return 'A TIEMPO';
    if (stages.every(s => s.status === 'completed')) return 'FINALIZADO';
    // Without SLA, there's no 'delayed' — only A TIEMPO or FINALIZADO
    return 'A TIEMPO';
  }

  /** Derive cumplimiento % from built stages */
  private deriveCumplimiento(stages: any[]): number {
    if (!stages || stages.length === 0) return 0;
    const completed = stages.filter(s => s.status === 'completed').length;
    return Math.round((completed / stages.length) * 100);
  }

  /** Derive current stage from built stages (first non-completed) */
  private deriveCurrentStage(stages: any[]): string {
    if (!stages || stages.length === 0) return 'importacion';
    const current = stages.find(s => s.status !== 'completed');
    return current ? current.id : (stages[stages.length - 1]?.id || 'entrega');
  }

  private buildStages(
    hitoConfig: HitoConfig[] | undefined,
    subConfig: SubConfig[] | undefined,
    subetapaById: Map<number, SubetapaDef>,
    stagingRow: any | undefined,
    slaConfigs: SlaRow[],
    tipoVehiculoId: number,
    empresaId: number | null,
  ): any[] {

    const subConfigMap = new Map<number, SubConfig>();
    if (subConfig) {
      for (const sc of subConfig) subConfigMap.set(sc.subetapaId, sc);
    }

    const subDefsByHito = new Map<number, SubetapaDef[]>();
    for (const [, def] of subetapaById) {
      if (!def.hitoId) continue;
      const arr = subDefsByHito.get(def.hitoId) || [];
      arr.push(def);
      subDefsByHito.set(def.hitoId, arr);
    }

    // Only show hitos configured for this tipo_vehiculo — no fallback
    if (!hitoConfig || hitoConfig.length === 0) return [];

    const orderedHitoIds = hitoConfig
      .filter(c => c.activo !== false)
      .map(c => ({ hitoId: c.hitoId, carril: c.carril, grupoParaleloId: c.grupoParaleloId, icono: c.icono }));

    // 1. Build stages with subStages (real dates only)
    const stages = orderedHitoIds.map(({ hitoId, carril, grupoParaleloId, icono }) => {
      const slug = HITO_SLUG[hitoId] || `hito_${hitoId}`;

      const hitoSubDefs = subDefsByHito.get(hitoId) || [];

      const filteredSubs = (!subConfig || subConfig.length === 0) ? [] : hitoSubDefs
        .filter(sd => {
          const sc = subConfigMap.get(sd.id);
          return sc && sc.activo !== false;
        })
        .sort((a, b) => {
          const oa = subConfigMap.get(a.id)?.orden ?? 999;
          const ob = subConfigMap.get(b.id)?.orden ?? 999;
          return oa - ob;
        });

      const subStages = filteredSubs.map(sd => {
        let fechaReal: string = '';
        if (sd.campoStagingReal && stagingRow) {
          const val = stagingRow[sd.campoStagingReal];
          if (val) fechaReal = fmtDate(val);
        }

        let fechaPlanStaging: string = '';
        if (sd.campoStagingPlan && stagingRow) {
          const val = stagingRow[sd.campoStagingPlan];
          if (val) fechaPlanStaging = fmtDate(val);
        }

        const subStatus = fechaReal ? 'completed' : 'pending';

        return {
          id: `sub-${sd.id}`,
          _dbSubId: sd.id, // temporary — used for SLA resolution, removed before return
          name: sd.nombre || '',
          baseline: { start: '', end: '' },
          plan: { start: fechaPlanStaging, end: fechaPlanStaging },
          real: { start: fechaReal, end: fechaReal },
          status: subStatus,
        };
      });

      return {
        id: slug,
        name: HITO_LABELS[slug] || slug,
        icono: icono || null,
        carril: carril || 'operativo',
        grupoParaleloId: grupoParaleloId || null,
        status: 'pending', // will be derived after baseline/plan pass
        isParallel: grupoParaleloId != null,
        baseline: { start: '', end: '' },
        plan: { start: '', end: '' },
        real: { start: '', end: '' },
        subStages,
      };
    });

    // 2. Compute baseline & plan
    //    - First sub of entire flow: no baseline (already has real date)
    //    - Within same hito: sequential chain (sub → sub)
    //    - New group: starting point = previous group's last end (same carril preferred, fallback other)
    //    - Same group, same carril: sequential chain (hito chains from previous hito in same carril)
    //    - Same group, different carril: parallel (each carril starts from previous group's end)
    //    - If previous has no date: chain breaks → no baseline, no plan
    let prevGroupEndByCarril: Record<string, string> = {};
    let currentGroupEndByCarril: Record<string, string> = {};
    let currentGroupId: number | null | undefined = undefined;
    // Track running end per carril WITHIN the current group (for same-carril chaining)
    let inGroupRunningByCarril: Record<string, string> = {};

    for (const stage of stages) {
      const gid = stage.grupoParaleloId;
      const isNewGroup = gid == null || gid !== currentGroupId;

      if (isNewGroup) {
        // Finalize: previous group ends become the reference for the next group
        if (Object.keys(currentGroupEndByCarril).length > 0) {
          prevGroupEndByCarril = { ...currentGroupEndByCarril };
        }
        currentGroupEndByCarril = {};
        inGroupRunningByCarril = {};
        currentGroupId = gid;
      }

      const carril = stage.carril || 'operativo';
      const otherCarril = carril === 'financiero' ? 'operativo' : 'financiero';

      // Starting point for this hito:
      // - If same carril already has a running end within this group → chain from it (sequential within carril)
      // - Otherwise → previous group's end for same carril, fallback to other carril
      let prevEnd = inGroupRunningByCarril[carril]
        || prevGroupEndByCarril[carril]
        || prevGroupEndByCarril[otherCarril]
        || '';

      for (const sub of stage.subStages) {
        if (prevEnd) {
          sub.baseline = { start: prevEnd, end: prevEnd };

          // Plan from staging_vin takes priority; SLA as fallback
          if (!sub.plan.start) {
            const sla = this.resolveSlaInline(slaConfigs, (sub as any)._dbSubId, tipoVehiculoId, empresaId);
            if (sla) {
              sub.plan = { start: prevEnd, end: addDaysStr(prevEnd, sla.diasObjetivo) };
            }
          }
        }

        // Advance chain: real has priority, then plan. Empty = chain breaks.
        prevEnd = sub.real.end || sub.plan.end || '';
      }

      // Track running end for this carril within the current group
      if (prevEnd) {
        inGroupRunningByCarril[carril] = prevEnd;
      }

      // Track this hito's last end for the current group (by carril) — for cross-group reference
      if (prevEnd) {
        if (!currentGroupEndByCarril[carril] || prevEnd > currentGroupEndByCarril[carril]) {
          currentGroupEndByCarril[carril] = prevEnd;
        }
      }
    }

    // 3. Derive hito-level status and dates from subStages, then clean up _dbSubId
    for (const stage of stages) {
      const subs = stage.subStages;

      // Hito status
      if (subs.length === 0) {
        stage.status = 'pending';
      } else if (subs.every(s => s.status === 'completed')) {
        stage.status = 'completed';
      } else if (subs.some(s => s.status === 'completed')) {
        stage.status = 'active';
      } else {
        stage.status = 'pending';
      }

      // Hito-level dates: aggregate from subStages
      const firstSub = subs[0];
      const lastSub = subs[subs.length - 1];
      if (firstSub) {
        stage.baseline.start = firstSub.baseline.start;
        stage.plan.start = firstSub.plan.start;
        stage.real.start = firstSub.real.start;
      }
      if (lastSub) {
        stage.baseline.end = lastSub.baseline.end;
        stage.plan.end = lastSub.plan.end;
        stage.real.end = lastSub.real.end;
      }

      // Clean up temporary field
      for (const sub of subs) {
        delete (sub as any)._dbSubId;
      }
    }

    return stages;
  }

  /** Resolve the best SLA config for a subetapa (inline, no DB call) */
  private resolveSlaInline(
    configs: SlaRow[],
    subetapaDbId: number,
    tipoVehiculoId: number,
    empresaId: number | null,
  ): SlaRow | null {
    const candidates = configs.filter(s => {
      if (s.subetapaId && s.subetapaId !== subetapaDbId) return false;
      if (s.tipoVehiculoId && s.tipoVehiculoId !== tipoVehiculoId) return false;
      if (s.empresaId && empresaId && s.empresaId !== empresaId) return false;
      return true;
    });
    if (candidates.length === 0) return null;
    const score = (s: SlaRow) => [s.empresaId, s.subetapaId, s.tipoVehiculoId].filter(Boolean).length;
    return candidates.reduce((a, b) => score(a) >= score(b) ? a : b);
  }

}
