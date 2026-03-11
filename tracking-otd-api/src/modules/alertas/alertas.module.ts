import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alerta } from './alerta.entity';
import { AlertaAccion } from './alerta-accion.entity';
import { AlertasService } from './alertas.service';
import { AlertasController } from './alertas.controller';
import { AlertasScheduler } from './alertas.scheduler';
import { SlaModule } from '../sla/sla.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alerta, AlertaAccion]), SlaModule, TrackingModule],
  controllers: [AlertasController],
  providers: [AlertasService, AlertasScheduler],
  exports: [AlertasService],
})
export class AlertasModule {}
