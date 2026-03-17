import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { VinHitoTracking } from './vin-hito-tracking.entity';
import { VinSubetapaTracking } from './vin-subetapa-tracking.entity';
import { UpdateTrackingDto } from './dto/update-tracking.dto';

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
  campoStagingVin: string | null;
}

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(VinHitoTracking) private hitoTrackRepo: Repository<VinHitoTracking>,
    @InjectRepository(VinSubetapaTracking) private subetapaTrackRepo: Repository<VinSubetapaTracking>,
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
      .addSelect('f.forma_pago', 'formaPago')
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

    // 2. Load hito tracking for all VINs in bulk
    const vinIds = rows.map(r => r.vinId);
    if (vinIds.length === 0) return [];

    const hitoRows = await this.hitoTrackRepo
      .createQueryBuilder('ht')
      .leftJoinAndSelect('ht.hito', 'h')
      .where('ht.vin_id IN (:...vinIds)', { vinIds })
      .orderBy('ht.hito_id', 'ASC')
      .getMany();

    // 3. Load subetapa tracking for all VINs in bulk
    const subRows = await this.subetapaTrackRepo
      .createQueryBuilder('st')
      .leftJoinAndSelect('st.subetapa', 's')
      .where('st.vin_id IN (:...vinIds)', { vinIds })
      .orderBy('st.subetapa_id', 'ASC')
      .getMany();

    // 4. Load hito_tipo_vehiculo config (per tipo_vehiculo_id)
    const hitoConfigRows: any[] = await this.dataSource.createQueryBuilder()
      .select('htv.hito_id', 'hitoId')
      .addSelect('htv.tipo_vehiculo_id', 'tipoVehiculoId')
      .addSelect('htv.grupo_paralelo_id', 'grupoParaleloId')
      .addSelect('htv.carril', 'carril')
      .addSelect('htv.orden', 'orden')
      .addSelect('htv.activo', 'activo')
      .from('hito_tipo_vehiculo', 'htv')
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

    // 6. Load all subetapa definitions (for campo_staging_vin lookup)
    const allSubetapas: any[] = await this.dataSource.createQueryBuilder()
      .select('s.id', 'id')
      .addSelect('s.hito_id', 'hitoId')
      .addSelect('s.nombre', 'nombre')
      .addSelect('s.campo_staging_vin', 'campoStagingVin')
      .from('subetapa', 's')
      .getRawMany();

    const subetapaById = new Map<number, SubetapaDef>();
    for (const s of allSubetapas) {
      subetapaById.set(s.id, {
        id: s.id,
        hitoId: s.hitoId,
        nombre: s.nombre,
        campoStagingVin: s.campoStagingVin,
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

    // 8. Group tracking by VIN
    const hitosByVin = new Map<string, VinHitoTracking[]>();
    for (const ht of hitoRows) {
      const arr = hitosByVin.get(ht.vinId) || [];
      arr.push(ht);
      hitosByVin.set(ht.vinId, arr);
    }

    const subsByVin = new Map<string, VinSubetapaTracking[]>();
    for (const st of subRows) {
      const arr = subsByVin.get(st.vinId) || [];
      arr.push(st);
      subsByVin.set(st.vinId, arr);
    }

    // 9. Build hierarchical structure
    const clienteMap = new Map<number, any>();

    for (const row of rows) {
      const vinHitos = hitosByVin.get(row.vinId) || [];
      const vinSubs = subsByVin.get(row.vinId) || [];
      const tvId = row.tipoVehiculoId as number;
      const hitoConfig = hitoConfigByTipo.get(tvId);
      const subConfig = subConfigByTipo.get(tvId);
      const stagingRow = stagingByVin.get(row.vinId);

      const stages = this.buildStages(vinHitos, vinSubs, hitoConfig, subConfig, subetapaById, stagingRow, slaConfigs, tvId, row.empresaDbId);

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
          formaPago: row.formaPago || '',
          vins: [],
        });
      }
      client._fichaMap.get(row.fichaDbId).vins.push(vinObj);
    }

    // 10. Convert maps to arrays
    const result: any[] = [];
    for (const client of clienteMap.values()) {
      const fichas = Array.from(client._fichaMap.values());
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
    hitos: VinHitoTracking[],
    subs: VinSubetapaTracking[],
    hitoConfig: HitoConfig[] | undefined,
    subConfig: SubConfig[] | undefined,
    subetapaById: Map<number, SubetapaDef>,
    stagingRow: any | undefined,
    slaConfigs: SlaRow[],
    tipoVehiculoId: number,
    empresaId: number | null,
  ): any[] {
    const hitoTrackMap = new Map<number, VinHitoTracking>();
    for (const ht of hitos) hitoTrackMap.set(ht.hitoId, ht);

    const subTrackMap = new Map<number, VinSubetapaTracking>();
    for (const st of subs) subTrackMap.set(st.subetapaId, st);

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
      .map(c => ({ hitoId: c.hitoId, carril: c.carril, grupoParaleloId: c.grupoParaleloId }));

    // 1. Build stages with subStages (real dates only)
    const stages = orderedHitoIds.map(({ hitoId, carril, grupoParaleloId }) => {
      const ht = hitoTrackMap.get(hitoId);
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
        if (sd.campoStagingVin && stagingRow) {
          const val = stagingRow[sd.campoStagingVin];
          if (val) fechaReal = fmtDate(val);
        } else if (!sd.campoStagingVin) {
          const st = subTrackMap.get(sd.id);
          if (st?.fechaReal) fechaReal = fmtDate(st.fechaReal);
        }

        const subStatus = fechaReal ? 'completed' : 'pending';

        return {
          id: `sub-${sd.id}`,
          _dbSubId: sd.id, // temporary — used for SLA resolution, removed before return
          name: sd.nombre || '',
          baseline: { start: '', end: '' },
          plan: { start: '', end: '' },
          real: { start: fechaReal, end: fechaReal },
          status: subStatus,
        };
      });

      return {
        id: slug,
        name: HITO_LABELS[slug] || ht?.hito?.nombre || slug,
        carril: carril || ht?.hito?.carril || 'operativo',
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
    //    - New group: first sub baseline = previous group's last end (same carril preferred, fallback other)
    //    - Same parallel group: each hito starts from previous group's end (parallel execution)
    //    - If previous has no date: chain breaks → no baseline, no plan
    let prevGroupEndByCarril: Record<string, string> = {};
    let currentGroupEndByCarril: Record<string, string> = {};
    let currentGroupId: number | null | undefined = undefined;

    for (const stage of stages) {
      const gid = stage.grupoParaleloId;
      const isNewGroup = gid == null || gid !== currentGroupId;

      if (isNewGroup) {
        // Finalize: previous group ends become the reference for the next group
        if (Object.keys(currentGroupEndByCarril).length > 0) {
          prevGroupEndByCarril = { ...currentGroupEndByCarril };
        }
        currentGroupEndByCarril = {};
        currentGroupId = gid;
      }

      const carril = stage.carril || 'operativo';
      const otherCarril = carril === 'financiero' ? 'operativo' : 'financiero';

      // Starting point: previous group's end for same carril, fallback to other carril
      let prevEnd = prevGroupEndByCarril[carril] || prevGroupEndByCarril[otherCarril] || '';

      for (const sub of stage.subStages) {
        if (prevEnd) {
          sub.baseline = { start: prevEnd, end: prevEnd };

          // Plan = baseline.start + SLA diasObjetivo
          const sla = this.resolveSlaInline(slaConfigs, (sub as any)._dbSubId, tipoVehiculoId, empresaId);
          if (sla) {
            sub.plan = { start: prevEnd, end: addDaysStr(prevEnd, sla.diasObjetivo) };
          }
        }

        // Advance chain: real has priority, then plan. Empty = chain breaks.
        prevEnd = sub.real.end || sub.plan.end || '';
      }

      // Track this hito's last end for the current group (by carril)
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

  // ── Single VIN tracking ──

  async getTrackingVin(vinId: string) {
    const hitos = await this.hitoTrackRepo.find({
      where: { vinId },
      relations: ['hito'],
      order: { hitoId: 'ASC' },
    });
    const subetapas = await this.subetapaTrackRepo.find({
      where: { vinId },
      relations: ['subetapa'],
      order: { subetapaId: 'ASC' },
    });

    return {
      vinId,
      hitos: hitos.map(h => ({
        ...h,
      })),
      subetapas: subetapas.map(s => ({
        ...s,
        diferenciaDias: this.calcularDiferenciaDias(s.fechaPlan, s.fechaReal),
      })),
    };
  }

  async updateHitoTracking(vinId: string, hitoId: number, dto: UpdateTrackingDto): Promise<VinHitoTracking> {
    let record = await this.hitoTrackRepo.findOne({ where: { vinId, hitoId } });
    if (!record) {
      record = this.hitoTrackRepo.create({ vinId, hitoId });
    }
    Object.assign(record, dto);
    return this.hitoTrackRepo.save(record);
  }

  async updateSubetapaTracking(vinId: string, subetapaId: number, dto: UpdateTrackingDto): Promise<VinSubetapaTracking> {
    let record = await this.subetapaTrackRepo.findOne({ where: { vinId, subetapaId } });
    if (!record) {
      record = this.subetapaTrackRepo.create({ vinId, subetapaId });
    }
    Object.assign(record, dto);
    return this.subetapaTrackRepo.save(record);
  }

  async syncFromStaging(vinId: string, staging: Record<string, any>): Promise<void> {
    const mapeo: Array<{ nombre: string; fecha: Date }> = [
      { nombre: 'Solicitud negocio',   fecha: staging.fechaColocacion },
      { nombre: 'Pedido fábrica',       fecha: staging.fechaColocacion },
      { nombre: 'Producción',           fecha: staging.fechaLiberacionFabrica },
      { nombre: 'Embarque',             fecha: staging.etd ?? staging.fechaEmbarqueSap },
      { nombre: 'En aduana',            fecha: staging.fechaLlegadaAduana ?? staging.fechaAduanaSap },
      { nombre: 'En almacén',           fecha: staging.fechaIngresoPatio ?? staging.fechaLiberadoSap },
      { nombre: 'Reserva',              fecha: staging.fechaPreasignacion },
      { nombre: 'Asig. Definitiva',     fecha: staging.fechaAsignacion },
      { nombre: 'Emisión Factura',      fecha: staging.fechaFacturacionSap ?? staging.fechaFacturaComex },
      { nombre: 'Inicio PDI',           fecha: staging.fechaRecojoCarrZcar },
      { nombre: 'En Carrocero Local',   fecha: staging.fechaIngresoProdCarrReal },
      { nombre: 'Salida PDI',           fecha: staging.fechaFinProdCarrReal },
      { nombre: 'Inicio Trámite',       fecha: staging.fcc },
      { nombre: 'Placas Recibidas',     fecha: staging.fclr },
      { nombre: 'Entregado al Cliente', fecha: staging.fechaEntregaCliente ?? staging.fechaEntregaReal },
    ];

    for (const { nombre, fecha } of mapeo) {
      if (!fecha || GAP_MANUALES.includes(nombre)) continue;

      const existing = await this.subetapaTrackRepo
        .createQueryBuilder('vst')
        .leftJoin('vst.subetapa', 's')
        .where('vst.vin_id = :vinId', { vinId })
        .andWhere('s.nombre = :nombre', { nombre })
        .getOne();

      if (existing) {
        existing.fechaReal = new Date(fecha);
        await this.subetapaTrackRepo.save(existing);
      }
    }
  }

}
