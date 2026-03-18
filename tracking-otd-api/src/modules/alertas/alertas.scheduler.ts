import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from './alerta.entity';
import { SlaService } from '../sla/sla.service';

@Injectable()
export class AlertasScheduler {
  private readonly logger = new Logger(AlertasScheduler.name);

  constructor(
    @InjectRepository(Alerta) private alertaRepo: Repository<Alerta>,
    private slaService: SlaService,
  ) {}

  @Cron('0 */6 * * *')
  async detectarSlaVencidos() {
    this.logger.log('Iniciando detección de SLA vencidos...');
    try {
      // TODO: Reimplementar usando staging_vin como fuente de verdad
      this.logger.log('Detección de SLA vencidos completada');
    } catch (err) {
      this.logger.error('Error en detección de SLA vencidos', err);
    }
  }
}
