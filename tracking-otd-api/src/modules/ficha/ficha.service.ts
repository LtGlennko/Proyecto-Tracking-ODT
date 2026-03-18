import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ficha } from './ficha.entity';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { FilterFichaDto } from './dto/filter-ficha.dto';

@Injectable()
export class FichaService {
  constructor(
    @InjectRepository(Ficha)
    private repo: Repository<Ficha>,
  ) {}

  async findAll(filters: FilterFichaDto) {
    const { page = 1, limit = 20, clienteId, empresaId } = filters;
    const qb = this.repo.createQueryBuilder('f')
      .leftJoinAndSelect('f.cliente', 'cliente')
      .leftJoinAndSelect('cliente.empresa', 'empresa');
    if (clienteId) qb.andWhere('f.cliente_id = :clienteId', { clienteId });
    if (empresaId) qb.andWhere('empresa.id = :empresaId', { empresaId });
    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { _pagination: { items, total, page, limit } };
  }

  async findOne(id: number): Promise<Ficha> {
    const ficha = await this.repo.findOne({ where: { id }, relations: ['cliente', 'cliente.empresa'] });
    if (!ficha) throw new NotFoundException(`Ficha ${id} no encontrada`);
    return ficha;
  }

  create(dto: CreateFichaDto): Promise<Ficha> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateFichaDto): Promise<Ficha> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }
}
