import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TrackingService } from './tracking.service';
import { VinHitoTracking } from './vin-hito-tracking.entity';
import { VinSubetapaTracking } from './vin-subetapa-tracking.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(dto => dto),
  update: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  })),
});

describe('TrackingService', () => {
  let service: TrackingService;
  let hitoRepo: ReturnType<typeof mockRepo>;
  let subetapaRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: getRepositoryToken(VinHitoTracking), useFactory: mockRepo },
        { provide: getRepositoryToken(VinSubetapaTracking), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
    hitoRepo = module.get(getRepositoryToken(VinHitoTracking));
    subetapaRepo = module.get(getRepositoryToken(VinSubetapaTracking));
  });

  describe('syncFromStaging()', () => {
    it('debe mapear fecha_colocacion → Solicitud negocio', async () => {
      const mockQb = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 1, vinId: 'VIN1', subetapaId: 1, fechaReal: null }),
      };
      subetapaRepo.createQueryBuilder.mockReturnValue(mockQb);
      subetapaRepo.save.mockResolvedValue({});

      const staging = { fechaColocacion: new Date('2024-01-15') };
      await service.syncFromStaging('VIN1', staging);

      expect(subetapaRepo.save).toHaveBeenCalled();
    });

    it('debe usar etd sobre fecha_embarque_sap cuando etd está disponible', async () => {
      const savedRecords: any[] = [];
      const mockQb = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 1, vinId: 'VIN1', subetapaId: 3 }),
      };
      subetapaRepo.createQueryBuilder.mockReturnValue(mockQb);
      subetapaRepo.save.mockImplementation(r => { savedRecords.push(r); return r; });

      const etdDate = new Date('2024-03-10');
      const staging = { etd: etdDate, fechaEmbarqueSap: new Date('2024-03-20') };
      await service.syncFromStaging('VIN1', staging);

      const embarqueRecord = savedRecords.find(r => r.fechaReal?.getTime() === etdDate.getTime());
      expect(embarqueRecord).toBeDefined();
    });

    it('debe usar fecha_llegada_aduana sobre fecha_aduana_sap cuando está disponible', async () => {
      const mockQb = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 1, vinId: 'VIN1', subetapaId: 4 }),
      };
      subetapaRepo.createQueryBuilder.mockReturnValue(mockQb);
      subetapaRepo.save.mockResolvedValue({});

      const aduanaDate = new Date('2024-04-01');
      const staging = { fechaLlegadaAduana: aduanaDate, fechaAduanaSap: new Date('2024-04-10') };
      await service.syncFromStaging('VIN1', staging);

      expect(subetapaRepo.save).toHaveBeenCalled();
    });

    it('no debe sobrescribir fechas manuales de los 5 GAPs', async () => {
      const mockQb = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      subetapaRepo.createQueryBuilder.mockReturnValue(mockQb);

      const staging = {}; // GAPs have no staging fields
      await service.syncFromStaging('VIN1', staging);

      // save should not be called for GAP subetapas
      const gapNames = ['Solicitud crédito', 'Aprobación', 'Pago Confirmado', 'Unidad Lista', 'Cita Agendada'];
      // Since staging has no values for these, save would not be called
      expect(subetapaRepo.save).not.toHaveBeenCalledWith(
        expect.objectContaining({ subetapa: expect.objectContaining({ nombre: gapNames[0] }) })
      );
    });
  });

  describe('calcularDiferenciaDias()', () => {
    it('debe retornar null si alguna fecha es null', () => {
      expect(service.calcularDiferenciaDias(null, new Date())).toBeNull();
      expect(service.calcularDiferenciaDias(new Date(), null)).toBeNull();
      expect(service.calcularDiferenciaDias(null, null)).toBeNull();
    });

    it('debe retornar positivo si fechaReal > fechaPlan (retraso)', () => {
      const plan = new Date('2024-01-01');
      const real = new Date('2024-01-06');
      expect(service.calcularDiferenciaDias(plan, real)).toBe(5);
    });

    it('debe retornar negativo si fechaReal < fechaPlan (adelanto)', () => {
      const plan = new Date('2024-01-10');
      const real = new Date('2024-01-05');
      expect(service.calcularDiferenciaDias(plan, real)).toBe(-5);
    });

    it('no debe persistir diferencia_dias en BD', async () => {
      const plan = new Date('2024-01-01');
      const real = new Date('2024-01-06');
      service.calcularDiferenciaDias(plan, real);
      expect(hitoRepo.save).not.toHaveBeenCalled();
      expect(subetapaRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('calcularEstadoGeneral()', () => {
    it('debe retornar FINALIZADO si todos los hitos están finalizados', () => {
      const hitos = [{ estado: 'FINALIZADO' }, { estado: 'FINALIZADO' }];
      expect(service.calcularEstadoGeneral(hitos)).toBe('FINALIZADO');
    });

    it('debe retornar DEMORADO si al menos 1 hito está demorado', () => {
      const hitos = [{ estado: 'A TIEMPO' }, { estado: 'DEMORADO' }, { estado: 'FINALIZADO' }];
      expect(service.calcularEstadoGeneral(hitos)).toBe('DEMORADO');
    });

    it('debe retornar A TIEMPO en cualquier otro caso', () => {
      const hitos = [{ estado: 'A TIEMPO' }, { estado: 'ACTIVO' }];
      expect(service.calcularEstadoGeneral(hitos)).toBe('A TIEMPO');
    });
  });
});
