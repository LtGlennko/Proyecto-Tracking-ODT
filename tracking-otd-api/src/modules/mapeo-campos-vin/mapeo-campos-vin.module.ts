import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapeoCampoVin } from './mapeo-campo-vin.entity';
import { MapeoCamposVinService } from './mapeo-campos-vin.service';
import { MapeoCamposVinController } from './mapeo-campos-vin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MapeoCampoVin])],
  controllers: [MapeoCamposVinController],
  providers: [MapeoCamposVinService],
  exports: [MapeoCamposVinService, TypeOrmModule],
})
export class MapeoCamposVinModule {}
