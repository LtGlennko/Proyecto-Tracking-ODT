import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { FilterClienteDto } from './dto/filter-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private repo: Repository<Cliente>,
  ) {}

  async findAll(filters: FilterClienteDto) {
    const { page = 1, limit = 20, empresaId, isVic, busqueda } = filters;
    const qb = this.repo.createQueryBuilder('c').leftJoinAndSelect('c.empresa', 'empresa');
    if (empresaId) qb.andWhere('c.empresa_id = :empresaId', { empresaId });
    if (isVic !== undefined) qb.andWhere('c.is_vic = :isVic', { isVic });
    if (busqueda) qb.andWhere('(c.nombre ILIKE :q OR c.ruc ILIKE :q)', { q: `%${busqueda}%` });
    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { _pagination: { items, total, page, limit } };
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.repo.findOne({ where: { id }, relations: ['empresa'] });
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return cliente;
  }

  create(dto: CreateClienteDto): Promise<Cliente> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateClienteDto): Promise<Cliente> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }
}
