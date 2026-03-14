import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, IsNull, Repository } from 'typeorm';
import { Alerta } from './alerta.entity';
import { VinHitoTracking } from '../tracking/vin-hito-tracking.entity';
import { SlaService } from '../sla/sla.service';

@Injectable()
export class AlertasScheduler {
  private readonly logger = new Logger(AlertasScheduler.name);

  constructor(
    @InjectRepository(Alerta) private alertaRepo: Repository<Alerta>,
    @InjectRepository(VinHitoTracking) private trackRepo: Repository<VinHitoTracking>,
    private slaService: SlaService,
  ) {}

  @Cron('0 */6 * * *')
  async detectarSlaVencidos() {
    this.logger.log('Iniciando detección de SLA vencidos...');
    try {
      // Find hitos with a plan date set (SLA-tracked)
      const activos = await this.trackRepo.find({
        where: { fechaPlan: Not(IsNull()) },
        relations: ['hito'],
      });

      for (const tracking of activos) {
        if (!tracking.fechaPlan) continue;
        const diasRetraso = Math.ceil((Date.now() - new Date(tracking.fechaPlan).getTime()) / 86400000);
        if (diasRetraso <= 0) continue;

        const sla = await this.slaService.resolve({ subetapaId: undefined });
        if (!sla) continue;

        const key = `${tracking.vinId}-${tracking.hitoId}`;
        const existente = await this.alertaRepo.findOne({
          where: { vinId: tracking.vinId, hitoId: tracking.hitoId, estadoAlerta: 'activa' },
        });

        const diasCritico = sla.diasObjetivo + sla.diasTolerancia;

        if (diasRetraso > diasCritico) {
          if (existente) {
            await this.alertaRepo.update(existente.id, { nivel: 'critico', diasDemora: diasRetraso });
          } else {
            await this.alertaRepo.save(this.alertaRepo.create({
              vinId: tracking.vinId, hitoId: tracking.hitoId,
              nivel: 'critico', diasDemora: diasRetraso,
              estadoAlerta: 'activa', fechaGeneracion: new Date(),
            }));
          }
        } else if (diasRetraso > sla.diasObjetivo && !existente) {
          await this.alertaRepo.save(this.alertaRepo.create({
            vinId: tracking.vinId, hitoId: tracking.hitoId,
            nivel: 'advertencia', diasDemora: diasRetraso,
            estadoAlerta: 'activa', fechaGeneracion: new Date(),
          }));
        }
      }
      this.logger.log('Detección de SLA vencidos completada');
    } catch (err) {
      this.logger.error('Error en detección de SLA vencidos', err);
    }
  }
}
