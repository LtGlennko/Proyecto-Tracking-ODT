import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hito } from './hito.entity';
import { Subetapa } from './subetapa.entity';
import { GrupoParalelo } from './grupo-paralelo.entity';
import { HitoTipoVehiculo } from './hito-tipo-vehiculo.entity';
import { SubetapaTipoVehiculo } from './subetapa-tipo-vehiculo.entity';
import { HitosService } from './hitos.service';
import { HitosController } from './hitos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    Hito, Subetapa, GrupoParalelo,
    HitoTipoVehiculo, SubetapaTipoVehiculo,
  ])],
  controllers: [HitosController],
  providers: [HitosService],
  exports: [HitosService, TypeOrmModule],
})
export class HitosModule {}
