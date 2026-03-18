import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuenteVin } from './fuente-vin.entity';

@Injectable()
export class FuentesVinService {
  constructor(
    @InjectRepository(FuenteVin) private repo: Repository<FuenteVin>,
  ) {}

  findAll(): Promise<FuenteVin[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<FuenteVin> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Fuente ${id} no encontrada`);
    return item;
  }

  create(dto: Partial<FuenteVin>): Promise<FuenteVin> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<FuenteVin>): Promise<FuenteVin> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
