import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MapeoCampoVin } from './mapeo-campo-vin.entity';
import { StagingVin } from '../staging/staging-vin.entity';

export interface StagingColumnInfo {
  name: string;
  type: 'fecha' | 'texto' | 'numero';
}

@Injectable()
export class MapeoCamposVinService {
  constructor(
    @InjectRepository(MapeoCampoVin) private repo: Repository<MapeoCampoVin>,
    private dataSource: DataSource,
  ) {}

  /** Returns all staging_vin columns with name and type */
  getStagingColumns(): StagingColumnInfo[] {
    const metadata = this.dataSource.getMetadata(StagingVin);
    return metadata.columns
      .filter(c => !['created_at', 'updated_at'].includes(c.databaseName))
      .map(c => {
        const dbType = String(c.type || '').toLowerCase();
        let type: 'fecha' | 'texto' | 'numero' = 'texto';
        if (['date', 'timestamp', 'timestamp without time zone'].includes(dbType)) type = 'fecha';
        else if (['int', 'integer', 'decimal', 'numeric', 'float', 'double'].includes(dbType)) type = 'numero';
        return { name: c.databaseName, type };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findAll(nombreCampo?: string): Promise<MapeoCampoVin[]> {
    const qb = this.repo.createQueryBuilder('m')
      .leftJoinAndSelect('m.fuente', 'f')
      .orderBy('m.nombre_campo', 'ASC')
      .addOrderBy('m.prioridad', 'ASC');
    if (nombreCampo) qb.andWhere('m.nombre_campo = :nombreCampo', { nombreCampo });
    return qb.getMany();
  }

  async findGrouped(): Promise<Record<string, MapeoCampoVin[]>> {
    const all = await this.findAll();
    const grouped: Record<string, MapeoCampoVin[]> = {};
    for (const m of all) {
      if (!grouped[m.nombreCampo]) grouped[m.nombreCampo] = [];
      grouped[m.nombreCampo].push(m);
    }
    return grouped;
  }

  create(dto: Partial<MapeoCampoVin>): Promise<MapeoCampoVin> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<MapeoCampoVin>): Promise<MapeoCampoVin> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Mapeo ${id} no encontrado`);
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id }, relations: ['fuente'] });
  }

  async remove(id: number): Promise<void> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Mapeo ${id} no encontrado`);
    await this.repo.delete(id);
  }

  /** Reorder priorities for a given campo based on array order */
  async reorder(nombreCampo: string, orderedIds: number[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.repo.update(orderedIds[i], { prioridad: i + 1 });
    }
  }
}
