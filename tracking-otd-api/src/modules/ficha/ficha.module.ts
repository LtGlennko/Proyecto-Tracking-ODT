import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ficha } from './ficha.entity';
import { FichaService } from './ficha.service';
import { FichaController } from './ficha.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ficha])],
  controllers: [FichaController],
  providers: [FichaService],
  exports: [FichaService],
})
export class FichaModule {}
