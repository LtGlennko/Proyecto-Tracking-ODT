import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/** Format a Date to ISO date string, or empty string */
function fmtDate(d: Date | null | undefined): string {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

/** Add days to a YYYY-MM-DD date string */
function addDaysStr(dateStr: string, days: number | string): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + Number(days));
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
  page?: number;
  pageSize?: number;
}

interface HitoConfig {
  hitoId: number;
  nombre: string;
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
    // 1. Load all VINs from vista_tracking_vin (pre-joined view)
    const qb = this.dataSource.createQueryBuilder()
      .select('vt.vin', 'vinId')
      .addSelect('vt.modelo', 'modelo')
      .addSelect('vt.tipo_vehiculo_id', 'tipoVehiculoId')
      .addSelect('vt.tipo_vehiculo_nombre', 'tipoVehiculoNombre')
      .addSelect('vt.tipo_vehiculo_color', 'tipoVehiculoColor')
      .addSelect('vt.tipo_vehiculo_icono', 'tipoVehiculoIcono')
      .addSelect('vt.lote', 'lote')
      .addSelect('vt.orden_compra', 'ordenCompra')
      .addSelect('vt.ultima_actualizacion', 'ultimaActualizacion')
      .addSelect('vt.staging_created_at', 'stagingCreatedAt')
      .addSelect('vt.ficha_codigo', 'fichaCodigo')
      .addSelect('vt.forma_pago', 'formaPago')
      .addSelect('vt.ficha_fecha_creacion', 'fechaCreacion')
      .addSelect('vt.ejecutivo', 'ejecutivo')
      .addSelect('vt.cliente_id', 'clienteDbId')
      .addSelect('vt.cliente_nombre', 'clienteNombre')
      .addSelect('vt.cliente_is_vic', 'isVic')
      .addSelect('vt.empresa_id', 'empresaDbId')
      .addSelect('vt.empresa_nombre', 'empresaNombre')
      .from('vista_tracking_vin', 'vt');

    if (filters.empresaId) {
      qb.andWhere('vt.empresa_id = :empresaId', { empresaId: filters.empresaId });
    }
    if (filters.tipoVehiculoId) {
      qb.andWhere('vt.tipo_vehiculo_id = :tipoVehiculoId', { tipoVehiculoId: filters.tipoVehiculoId });
    }
    if (filters.busqueda) {
      qb.andWhere(
        '(vt.vin ILIKE :q OR vt.cliente_nombre ILIKE :q OR vt.modelo ILIKE :q OR vt.ficha_codigo ILIKE :q)',
        { q: `%${filters.busqueda}%` },
      );
    }

    // Only show VINs with PROPED data + at least 5 date fields populated
    qb.andWhere('(vt.etd IS NOT NULL OR vt.eta IS NOT NULL)');
    qb.andWhere(`(
      CASE WHEN vt.fecha_colocacion IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_embarque_sap IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_llegada_aduana IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_preasignacion IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_asignacion IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_facturacion_sap IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_inscrito IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_entrega_cliente IS NOT NULL THEN 1 ELSE 0 END
    ) >= 5`);

    qb.orderBy('vt.cliente_nombre', 'ASC').addOrderBy('vt.ficha_codigo', 'ASC').addOrderBy('vt.vin', 'ASC');

    // Count total before pagination (same filters including completeness)
    const countQb = this.dataSource.createQueryBuilder()
      .select('COUNT(*)', 'total')
      .from('vista_tracking_vin', 'vt');
    if (filters.empresaId) countQb.andWhere('vt.empresa_id = :empresaId', { empresaId: filters.empresaId });
    if (filters.tipoVehiculoId) countQb.andWhere('vt.tipo_vehiculo_id = :tipoVehiculoId', { tipoVehiculoId: filters.tipoVehiculoId });
    if (filters.busqueda) countQb.andWhere('(vt.vin ILIKE :q OR vt.cliente_nombre ILIKE :q OR vt.modelo ILIKE :q OR vt.ficha_codigo ILIKE :q)', { q: `%${filters.busqueda}%` });
    countQb.andWhere('(vt.etd IS NOT NULL OR vt.eta IS NOT NULL)');
    countQb.andWhere(`(
      CASE WHEN vt.fecha_colocacion IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_embarque_sap IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_llegada_aduana IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_preasignacion IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_asignacion IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_facturacion_sap IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_inscrito IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_entrega_cliente IS NOT NULL THEN 1 ELSE 0 END
    ) >= 5`);
    const countResult = await countQb.getRawOne();
    const totalVins = parseInt(countResult?.total || '0', 10);

    // Apply pagination in SQL
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50;
    qb.offset((page - 1) * pageSize).limit(pageSize);

    const rows: any[] = await qb.getRawMany();

    const vinIds = rows.map(r => r.vinId);
    if (vinIds.length === 0) return { data: [], total: totalVins, page, pageSize, summary: { total: totalVins, demorado: 0 } };

    // 2. Load hito_tipo_vehiculo config (per tipo_vehiculo_id)
    const hitoConfigRows: any[] = await this.dataSource.createQueryBuilder()
      .select('htv.hito_id', 'hitoId')
      .addSelect('htv.tipo_vehiculo_id', 'tipoVehiculoId')
      .addSelect('htv.grupo_paralelo_id', 'grupoParaleloId')
      .addSelect('htv.carril', 'carril')
      .addSelect('htv.orden', 'orden')
      .addSelect('htv.activo', 'activo')
      .addSelect('h.nombre', 'nombre')
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
        nombre: r.nombre || `Hito ${r.hitoId}`,
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

    // 7. Load full vista_tracking_vin rows for date resolution via campo_staging_real/plan
    const stagingRows: any[] = await this.dataSource.createQueryBuilder()
      .select('vt.*')
      .from('vista_tracking_vin', 'vt')
      .where('vt.vin IN (:...vinIds)', { vinIds })
      .getRawMany();

    const stagingByVin = new Map<string, any>();
    for (const sv of stagingRows) {
      stagingByVin.set(sv.vin, sv);
    }

    // 8. Build hierarchical structure + count states
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
          color: row.tipoVehiculoColor,
          icono: row.tipoVehiculoIcono || null,
        },
        modelo: row.modelo,
        lote: row.lote || '',
        ordenCompra: row.ordenCompra || '',
        formaPago: row.formaPago || '',
        ejecutivo: row.ejecutivo || '',
        estadoGeneral,
        currentStageId,
        lastUpdate: row.ultimaActualizacion ? new Date(row.ultimaActualizacion + 'Z').toISOString() : (row.stagingCreatedAt ? new Date(row.stagingCreatedAt + 'Z').toISOString() : ''),
        daysDelayed: 0, // Without SLA there's no delay calculation
        diasVendedorComercial: 0,
        cumplimiento,
        stages,
      };

      const clientKey = row.clienteDbId || row.clienteNombre || 'Sin cliente';
      if (!clienteMap.has(clientKey)) {
        clienteMap.set(clientKey, {
          id: clientKey,
          name: row.clienteNombre || 'Sin cliente',
          empresa: row.empresaNombre || 'Divemotor',
          isVic: row.isVic || false,
          _fichaMap: new Map<string, any>(),
        });
      }
      const client = clienteMap.get(clientKey);

      const fichaKey = row.fichaCodigo || row.vinId;
      if (!client._fichaMap.has(fichaKey)) {
        client._fichaMap.set(fichaKey, {
          id: fichaKey,
          clientId: clientKey,
          clientName: row.clienteNombre || 'Sin cliente',
          dateCreated: row.fechaCreacion ? new Date(row.fechaCreacion).toISOString().slice(0, 10) : '',
          executive: row.ejecutivo || '',
          formasPago: new Set<string>(),
          vins: [],
        });
      }
      const ficha = client._fichaMap.get(fichaKey);
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

    return { data: result, total: totalVins, page, pageSize };
  }

  /**
   * Lightweight summary: counts total and demorados across ALL VINs (no pagination).
   * Builds stages for each VIN but skips hierarchy construction.
   */
  async getSummary(filters: { empresaId?: number; tipoVehiculoId?: number; busqueda?: string }) {
    const qb = this.dataSource.createQueryBuilder()
      .select('vt.vin', 'vinId')
      .addSelect('vt.tipo_vehiculo_id', 'tipoVehiculoId')
      .addSelect('vt.empresa_id', 'empresaDbId')
      .from('vista_tracking_vin', 'vt');

    if (filters.empresaId) qb.andWhere('vt.empresa_id = :empresaId', { empresaId: filters.empresaId });
    if (filters.tipoVehiculoId) qb.andWhere('vt.tipo_vehiculo_id = :tipoVehiculoId', { tipoVehiculoId: filters.tipoVehiculoId });
    if (filters.busqueda) qb.andWhere('(vt.vin ILIKE :q OR vt.cliente_nombre ILIKE :q OR vt.modelo ILIKE :q OR vt.ficha_codigo ILIKE :q)', { q: `%${filters.busqueda}%` });

    // Same completeness filter as clientes endpoint
    qb.andWhere('(vt.etd IS NOT NULL OR vt.eta IS NOT NULL)');
    qb.andWhere(`(
      CASE WHEN vt.fecha_colocacion IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_embarque_sap IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_llegada_aduana IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_preasignacion IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_asignacion IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_facturacion_sap IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_inscrito IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN vt.fecha_entrega_cliente IS NOT NULL THEN 1 ELSE 0 END
    ) >= 5`);

    const rows: any[] = await qb.getRawMany();
    if (rows.length === 0) return { total: 0, demorado: 0 };

    const vinIds = rows.map(r => r.vinId);

    // Load configs (cached per request)
    const [hitoConfigRows, subConfigRows, allSubetapas, slaConfigs, stagingRows] = await Promise.all([
      this.dataSource.createQueryBuilder().select('htv.hito_id', 'hitoId').addSelect('htv.tipo_vehiculo_id', 'tipoVehiculoId').addSelect('htv.grupo_paralelo_id', 'grupoParaleloId').addSelect('htv.carril', 'carril').addSelect('htv.orden', 'orden').addSelect('htv.activo', 'activo').addSelect('h.nombre', 'nombre').addSelect('h.icono', 'icono').from('hito_tipo_vehiculo', 'htv').leftJoin('hito', 'h', 'h.id = htv.hito_id').orderBy('htv.orden', 'ASC').getRawMany(),
      this.dataSource.createQueryBuilder().select('stv.subetapa_id', 'subetapaId').addSelect('stv.tipo_vehiculo_id', 'tipoVehiculoId').addSelect('stv.orden', 'orden').addSelect('stv.activo', 'activo').from('subetapa_tipo_vehiculo', 'stv').orderBy('stv.orden', 'ASC').getRawMany(),
      this.dataSource.createQueryBuilder().select('s.id', 'id').addSelect('s.hito_id', 'hitoId').addSelect('s.nombre', 'nombre').addSelect('s.campo_staging_real', 'campoStagingReal').addSelect('s.campo_staging_plan', 'campoStagingPlan').from('subetapa', 's').getRawMany(),
      this.dataSource.createQueryBuilder().select('s.empresa_id', 'empresaId').addSelect('s.subetapa_id', 'subetapaId').addSelect('s.tipo_vehiculo_id', 'tipoVehiculoId').addSelect('s.dias_objetivo', 'diasObjetivo').addSelect('s.dias_tolerancia', 'diasTolerancia').from('sla_config', 's').getRawMany() as Promise<SlaRow[]>,
      this.dataSource.createQueryBuilder().select('vt.*').from('vista_tracking_vin', 'vt').where('vt.vin IN (:...vinIds)', { vinIds }).getRawMany(),
    ]);

    const hitoConfigByTipo = new Map<number, HitoConfig[]>();
    for (const r of hitoConfigRows) { const k = r.tipoVehiculoId as number; if (!hitoConfigByTipo.has(k)) hitoConfigByTipo.set(k, []); hitoConfigByTipo.get(k)!.push({ hitoId: r.hitoId, nombre: r.nombre, grupoParaleloId: r.grupoParaleloId, carril: r.carril, orden: r.orden, activo: r.activo, icono: r.icono }); }
    const subConfigByTipo = new Map<number, SubConfig[]>();
    for (const r of subConfigRows) { const k = r.tipoVehiculoId as number; if (!subConfigByTipo.has(k)) subConfigByTipo.set(k, []); subConfigByTipo.get(k)!.push({ subetapaId: r.subetapaId, orden: r.orden, activo: r.activo }); }
    const subetapaById = new Map<number, SubetapaDef>();
    for (const s of allSubetapas) { subetapaById.set(s.id, { id: s.id, hitoId: s.hitoId, nombre: s.nombre, campoStagingReal: s.campoStagingReal, campoStagingPlan: s.campoStagingPlan }); }
    const stagingByVin = new Map<string, any>();
    for (const sv of stagingRows) { stagingByVin.set(sv.vin, sv); }

    let demorado = 0;
    for (const row of rows) {
      const stages = this.buildStages(hitoConfigByTipo.get(row.tipoVehiculoId as number), subConfigByTipo.get(row.tipoVehiculoId as number), subetapaById, stagingByVin.get(row.vinId), slaConfigs, row.tipoVehiculoId, row.empresaDbId);
      if (this.deriveEstadoGeneral(stages) === 'DEMORADO') demorado++;
    }

    return { total: rows.length, demorado };
  }

  /** Derive estadoGeneral from built stages (not from stored tracking values) */
  private deriveEstadoGeneral(stages: any[]): string {
    if (!stages || stages.length === 0) return 'A TIEMPO';
    if (stages.every(s => s.status === 'completed')) return 'ENTREGADO';
    if (stages.some(s => s.status === 'delayed')) return 'DEMORADO';
    return 'A TIEMPO';
  }

  /** Derive cumplimiento % from built stages */
  private deriveCumplimiento(stages: any[]): number {
    if (!stages || stages.length === 0) return 0;
    const completed = stages.filter(s => s.status === 'completed').length;
    return Math.round((completed / stages.length) * 100);
  }

  /** Derive current stage from built stages (first non-completed) */
  private deriveCurrentStage(stages: any[]): number | null {
    if (!stages || stages.length === 0) return null;
    const current = stages.find(s => s.status !== 'completed');
    return current ? current.id : (stages[stages.length - 1]?.id ?? null);
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
      .map(c => ({ hitoId: c.hitoId, nombre: c.nombre, carril: c.carril, grupoParaleloId: c.grupoParaleloId, icono: c.icono }));

    // 1. Build stages with subStages (real dates only)
    const stages = orderedHitoIds.map(({ hitoId, nombre, carril, grupoParaleloId, icono }) => {

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

        // campo_staging_plan ignorado por ahora — plan se calcula exclusivamente con SLA

        return {
          id: `sub-${sd.id}`,
          _dbSubId: sd.id, // temporary — used for SLA resolution, removed before return
          _slaTolerancia: 0, // temporary — filled in step 2
          name: sd.nombre || '',
          baseline: { start: '', end: '' },
          plan: { start: '', end: '' },
          real: { start: fechaReal, end: fechaReal },
          status: 'pending', // recalculated in step 3
        };
      });

      return {
        id: hitoId,
        name: nombre,
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

      // Starting point for this hito:
      // - If same carril already has a running end within this group → chain from it (sequential within carril)
      // - Otherwise → MAX of all carriles from previous group (group can't start until ALL prior carriles finish)
      const maxPrevGroupEnd = Object.values(prevGroupEndByCarril).filter(Boolean).sort().pop() || '';
      let prevEnd = inGroupRunningByCarril[carril]
        || maxPrevGroupEnd;

      for (const sub of stage.subStages) {
        // Resolve SLA for this sub (needed for plan fallback and tolerancia)
        const sla = this.resolveSlaInline(slaConfigs, (sub as any)._dbSubId, tipoVehiculoId, empresaId);
        if (sla) {
          (sub as any)._slaTolerancia = Number(sla.diasTolerancia) || 0;
        }

        if (prevEnd) {
          sub.baseline = { start: prevEnd, end: prevEnd };

          // Plan from staging_vin takes priority; SLA as fallback
          if (!sub.plan.start && sla) {
            sub.plan = { start: prevEnd, end: addDaysStr(prevEnd, sla.diasObjetivo) };
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

    // 3. Derive sub status (6 states) + hito status + dates, then clean up temp fields
    const todayMs = Date.now();
    for (const stage of stages) {
      const subs = stage.subStages;

      // Sub status: compare real/plan dates vs SLA tolerancia
      for (const sub of subs) {
        const planEnd = sub.plan.end;
        const realEnd = sub.real.end;
        const tolerancia = (sub as any)._slaTolerancia || 0;

        if (realEnd) {
          // Completed — check if on-time, in-tolerance, or late
          if (!planEnd) {
            sub.status = 'completed';
          } else {
            const planMs = new Date(planEnd).getTime();
            const realMs = new Date(realEnd).getTime();
            const diffDays = Math.round((realMs - planMs) / 86400000);
            if (diffDays <= 0) sub.status = 'completed';
            else if (diffDays <= tolerancia) sub.status = 'completed-risk';
            else sub.status = 'completed-late';
          }
        } else {
          // Pending — check if on-time, at-risk, or delayed
          if (!planEnd) {
            sub.status = 'on-time';
          } else {
            const planMs = new Date(planEnd).getTime();
            const diffDays = Math.round((todayMs - planMs) / 86400000);
            if (diffDays <= 0) sub.status = 'on-time';
            else if (diffDays <= tolerancia) sub.status = 'at-risk';
            else sub.status = 'delayed';
          }
        }
      }

      // Hito status: worst sub status wins
      if (subs.length === 0) {
        stage.status = 'pending';
      } else if (subs.some(s => s.status === 'delayed' || s.status === 'completed-late')) {
        stage.status = 'delayed';
      } else if (subs.some(s => s.status === 'at-risk' || s.status === 'completed-risk')) {
        stage.status = subs.every(s => s.status.startsWith('completed')) ? 'completed' : 'active';
      } else if (subs.every(s => s.status.startsWith('completed'))) {
        stage.status = 'completed';
      } else if (subs.some(s => s.status.startsWith('completed'))) {
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

      // Clean up temporary fields
      for (const sub of subs) {
        delete (sub as any)._dbSubId;
        delete (sub as any)._slaTolerancia;
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
