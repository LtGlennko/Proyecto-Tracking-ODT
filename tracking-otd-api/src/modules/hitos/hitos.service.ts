import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hito } from './hito.entity';
import { Subetapa } from './subetapa.entity';
import { GrupoParalelo } from './grupo-paralelo.entity';
import { SubetapaConfig } from './subetapa-config.entity';

@Injectable()
export class HitosService {
  constructor(
    @InjectRepository(Hito) private hitoRepo: Repository<Hito>,
    @InjectRepository(Subetapa) private subetapaRepo: Repository<Subetapa>,
    @InjectRepository(GrupoParalelo) private grupoRepo: Repository<GrupoParalelo>,
    @InjectRepository(SubetapaConfig) private configRepo: Repository<SubetapaConfig>,
  ) {}

  findAll(): Promise<Hito[]> {
    return this.hitoRepo.find({
      relations: ['grupoParalelo', 'subetapas'],
      order: { grupoParaleloId: 'ASC', orden: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Hito> {
    const hito = await this.hitoRepo.findOne({ where: { id }, relations: ['grupoParalelo', 'subetapas'] });
    if (!hito) throw new NotFoundException(`Hito ${id} no encontrado`);
    return hito;
  }

  create(dto: Partial<Hito>): Promise<Hito> {
    return this.hitoRepo.save(this.hitoRepo.create(dto));
  }

  async update(id: number, dto: Partial<Hito>): Promise<Hito> {
    await this.findOne(id);
    await this.hitoRepo.update(id, dto);
    return this.findOne(id);
  }

  async toggle(id: number): Promise<Hito> {
    const hito = await this.findOne(id);
    await this.hitoRepo.update(id, { activo: !hito.activo });
    return this.findOne(id);
  }

  findSubetapasByHito(hitoId: number): Promise<Subetapa[]> {
    return this.subetapaRepo.find({ where: { hitoId }, order: { orden: 'ASC' } });
  }

  createSubetapa(hitoId: number, dto: Partial<Subetapa>): Promise<Subetapa> {
    return this.subetapaRepo.save(this.subetapaRepo.create({ ...dto, hitoId }));
  }

  async updateSubetapa(id: number, dto: Partial<Subetapa>): Promise<Subetapa> {
    const sub = await this.subetapaRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException(`Subetapa ${id} no encontrada`);
    await this.subetapaRepo.update(id, dto);
    return this.subetapaRepo.findOne({ where: { id } });
  }

  async toggleSubetapa(id: number): Promise<Subetapa> {
    const sub = await this.subetapaRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException(`Subetapa ${id} no encontrada`);
    await this.subetapaRepo.update(id, { activoDefault: !sub.activoDefault });
    return this.subetapaRepo.findOne({ where: { id } });
  }

  addSubetapaConfig(subetapaId: number, dto: Partial<SubetapaConfig>): Promise<SubetapaConfig> {
    return this.configRepo.save(this.configRepo.create({ ...dto, subetapaId }));
  }

  async removeSubetapaConfig(configId: number): Promise<void> {
    await this.configRepo.delete(configId);
  }

  findGrupos(): Promise<GrupoParalelo[]> {
    return this.grupoRepo.find({ order: { ordenGlobal: 'ASC' } });
  }

  createGrupo(dto: Partial<GrupoParalelo>): Promise<GrupoParalelo> {
    return this.grupoRepo.save(this.grupoRepo.create(dto));
  }

  async updateGrupo(id: number, dto: Partial<GrupoParalelo>): Promise<GrupoParalelo> {
    await this.grupoRepo.update(id, dto);
    return this.grupoRepo.findOne({ where: { id } });
  }
}
