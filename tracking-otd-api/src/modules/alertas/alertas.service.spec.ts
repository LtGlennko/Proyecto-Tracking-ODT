import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { Alerta } from './alerta.entity';
import { AlertaAccion } from './alerta-accion.entity';

const makeAlerta = (overrides = {}): Partial<Alerta> => ({
  id: 1, vinId: 'VIN1', hitoId: 1,
  nivel: 'advertencia', estadoAlerta: 'activa', diasDemora: 3,
  ...overrides,
});

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  create: jest.fn(dto => dto),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
});

describe('AlertasService', () => {
  let service: AlertasService;
  let alertaRepo: ReturnType<typeof mockRepo>;
  let accionRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertasService,
        { provide: getRepositoryToken(Alerta), useFactory: mockRepo },
        { provide: getRepositoryToken(AlertaAccion), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<AlertasService>(AlertasService);
    alertaRepo = module.get(getRepositoryToken(Alerta));
    accionRepo = module.get(getRepositoryToken(AlertaAccion));
  });

  describe('updateEstado()', () => {
    it('debe actualizar estado a leida', async () => {
      const alerta = makeAlerta();
      alertaRepo.findOne.mockResolvedValue(alerta);
      accionRepo.find = jest.fn().mockResolvedValue([]);
      alertaRepo.update.mockResolvedValue({});
      alertaRepo.findOne.mockResolvedValueOnce(alerta).mockResolvedValueOnce({ ...alerta, estadoAlerta: 'leida' });

      const result = await service.updateEstado(1, { estado: 'leida' });

      expect(alertaRepo.update).toHaveBeenCalledWith(1, { estadoAlerta: 'leida' });
    });

    it('debe lanzar NotFoundException si alerta no existe', async () => {
      alertaRepo.findOne.mockResolvedValue(null);
      await expect(service.updateEstado(999, { estado: 'leida' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('createAccion()', () => {
    it('debe crear acción sobre alerta existente', async () => {
      const alerta = makeAlerta();
      alertaRepo.findOne.mockResolvedValue(alerta);
      accionRepo.find = jest.fn().mockResolvedValue([]);
      accionRepo.save.mockResolvedValue({ id: 1, alertaId: 1, accionTomada: 'contactar_responsable' });

      const result = await service.createAccion(1, { accionTomada: 'contactar_responsable' }, 42);

      expect(accionRepo.save).toHaveBeenCalled();
      expect(result.accionTomada).toBe('contactar_responsable');
    });

    it('debe lanzar NotFoundException si alerta no existe', async () => {
      alertaRepo.findOne.mockResolvedValue(null);
      await expect(service.createAccion(999, { accionTomada: 'resolver_alerta' })).rejects.toThrow(NotFoundException);
    });
  });
});
