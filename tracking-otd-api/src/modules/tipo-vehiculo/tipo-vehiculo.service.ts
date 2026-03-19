import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoVehiculo } from './tipo-vehiculo.entity';

@Injectable()
export class TipoVehiculoService {
  constructor(
    @InjectRepository(TipoVehiculo)
    private repo: Repository<TipoVehiculo>,
  ) {}

  findAll(): Promise<TipoVehiculo[]> {
    return this.repo.find({ where: { activo: true }, order: { id: 'ASC' } });
  }

  findAllIncludeInactive(): Promise<TipoVehiculo[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<TipoVehiculo> {
    const tv = await this.repo.findOne({ where: { id } });
    if (!tv) throw new NotFoundException(`Tipo de vehículo ${id} no encontrado`);
    return tv;
  }

  async create(dto: Partial<TipoVehiculo>): Promise<TipoVehiculo> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<TipoVehiculo>): Promise<TipoVehiculo> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }
}
