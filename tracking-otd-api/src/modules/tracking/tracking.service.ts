import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinHitoTracking } from './vin-hito-tracking.entity';
import { VinSubetapaTracking } from './vin-subetapa-tracking.entity';
import { UpdateTrackingDto } from './dto/update-tracking.dto';

// GAP manual subetapa names — never sync from staging
const GAP_MANUALES = ['Solicitud crédito', 'Aprobación', 'Pago Confirmado', 'Unidad Lista', 'Cita Agendada'];

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(VinHitoTracking) private hitoTrackRepo: Repository<VinHitoTracking>,
    @InjectRepository(VinSubetapaTracking) private subetapaTrackRepo: Repository<VinSubetapaTracking>,
  ) {}

  calcularDiferenciaDias(fechaPlan: Date, fechaReal: Date): number | null {
    if (!fechaPlan || !fechaReal) return null;
    return Math.ceil((new Date(fechaReal).getTime() - new Date(fechaPlan).getTime()) / 86400000);
  }

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
        diferenciaDias: this.calcularDiferenciaDias(h.fechaPlan, h.fechaReal),
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

  calcularEstadoGeneral(hitos: { estado: string }[]): string {
    if (!hitos || hitos.length === 0) return 'A TIEMPO';
    if (hitos.every(h => h.estado === 'FINALIZADO')) return 'FINALIZADO';
    if (hitos.some(h => h.estado === 'DEMORADO')) return 'DEMORADO';
    return 'A TIEMPO';
  }
}
