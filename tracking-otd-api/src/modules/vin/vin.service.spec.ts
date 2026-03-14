import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { VinService } from './vin.service';
import { Vin } from './vin.entity';

const mockQb = () => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
});

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(dto => dto),
  update: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQb()),
});

describe('VinService', () => {
  let service: VinService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VinService,
        { provide: getRepositoryToken(Vin), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<VinService>(VinService);
    repo = module.get(getRepositoryToken(Vin));
  });

  describe('findAll()', () => {
    it('debe filtrar por tipoVehiculoId', async () => {
      const qb = mockQb();
      repo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([[{ id: 'VIN1', tipoVehiculoId: 1 }], 1]);

      const result = await service.findAll({ tipoVehiculoId: 1, page: 1, limit: 20 });

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('tipo_vehiculo_id'),
        expect.objectContaining({ tipoVehiculoId: 1 }),
      );
    });

    it('debe filtrar por búsqueda en VIN, modelo, cliente y ficha', async () => {
      const qb = mockQb();
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ busqueda: 'WDB123', page: 1, limit: 20 });

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ q: '%WDB123%' }),
      );
    });

    it('debe retornar paginación correcta con total', async () => {
      const vins = [{ id: 'VIN1' }, { id: 'VIN2' }];
      const qb = mockQb();
      repo.createQueryBuilder.mockReturnValue(qb);
      qb.getManyAndCount.mockResolvedValue([vins, 2]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result._pagination.total).toBe(2);
      expect(result._pagination.items).toHaveLength(2);
    });
  });

  describe('findOne()', () => {
    it('debe lanzar NotFoundException si el VIN no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('VIN_INEXISTENTE')).rejects.toThrow(NotFoundException);
    });

    it('debe incluir hito trackings en la respuesta', async () => {
      const vin = { id: 'VIN1', modelo: 'Actros', ficha: { cliente: { empresa: {} } } };
      repo.findOne.mockResolvedValue(vin);

      const result = await service.findOne('VIN1');

      expect(result.id).toBe('VIN1');
      expect(result).toHaveProperty('estadoGeneral');
    });

    it('debe calcular diferenciaDias en memoria sin persistir', async () => {
      const vin = { id: 'VIN1', ficha: null };
      repo.findOne.mockResolvedValue(vin);

      await service.findOne('VIN1');

      expect(repo.save).not.toHaveBeenCalled();
      expect(repo.update).not.toHaveBeenCalled();
    });
  });
});
