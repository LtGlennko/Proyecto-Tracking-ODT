import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vin } from './vin.entity';
import { CreateVinDto } from './dto/create-vin.dto';
import { UpdateVinDto } from './dto/update-vin.dto';
import { FilterVinDto } from './dto/filter-vin.dto';

@Injectable()
export class VinService {
  constructor(
    @InjectRepository(Vin)
    private repo: Repository<Vin>,
  ) {}

  async findAll(filters: FilterVinDto) {
    const { page = 1, limit = 20, lineaNegocio, tipoVehiculo, empresaId, busqueda } = filters;
    const qb = this.repo.createQueryBuilder('v')
      .leftJoinAndSelect('v.ficha', 'ficha')
      .leftJoinAndSelect('ficha.cliente', 'cliente')
      .leftJoinAndSelect('cliente.empresa', 'empresa');

    if (lineaNegocio) qb.andWhere('v.linea_negocio = :lineaNegocio', { lineaNegocio });
    if (tipoVehiculo) qb.andWhere('v.tipo_vehiculo = :tipoVehiculo', { tipoVehiculo });
    if (empresaId) qb.andWhere('empresa.id = :empresaId', { empresaId });
    if (busqueda) {
      qb.andWhere(
        '(v.id ILIKE :q OR v.modelo ILIKE :q OR cliente.nombre ILIKE :q OR ficha.codigo ILIKE :q)',
        { q: `%${busqueda}%` },
      );
    }

    const [items, total] = await qb
      .orderBy('v.updated_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { _pagination: { items, total, page, limit } };
  }

  async findOne(id: string): Promise<Vin & { estadoGeneral: string }> {
    const vin = await this.repo.findOne({
      where: { id },
      relations: ['ficha', 'ficha.cliente', 'ficha.cliente.empresa'],
    });
    if (!vin) throw new NotFoundException(`VIN ${id} no encontrado`);

    return { ...vin, estadoGeneral: 'A TIEMPO' };
  }

  create(dto: CreateVinDto): Promise<Vin> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateVinDto): Promise<Vin> {
    await this.repo.findOne({ where: { id } }).then(v => {
      if (!v) throw new NotFoundException(`VIN ${id} no encontrado`);
    });
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  calcularDiferenciaDias(fechaPlan: Date, fechaReal: Date): number | null {
    if (!fechaPlan || !fechaReal) return null;
    return Math.ceil((fechaReal.getTime() - fechaPlan.getTime()) / 86400000);
  }

  calcularEstadoGeneral(hitos: { estado: string }[]): string {
    if (!hitos || hitos.length === 0) return 'A TIEMPO';
    if (hitos.every(h => h.estado === 'FINALIZADO')) return 'FINALIZADO';
    if (hitos.some(h => h.estado === 'DEMORADO')) return 'DEMORADO';
    return 'A TIEMPO';
  }
}
