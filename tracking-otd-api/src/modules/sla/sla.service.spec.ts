import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SlaService } from './sla.service';
import { SlaConfig } from './sla-config.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
});

describe('SlaService', () => {
  let service: SlaService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlaService,
        { provide: getRepositoryToken(SlaConfig), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<SlaService>(SlaService);
    repo = module.get(getRepositoryToken(SlaConfig));
  });

  describe('resolve()', () => {
    it('debe retornar la regla más específica (mayor score de dimensiones)', async () => {
      const rules: Partial<SlaConfig>[] = [
        { id: 1, empresaId: 1, subetapaId: null, tipoVehiculoId: null, diasObjetivo: 5, diasTolerancia: 2 },
        { id: 2, empresaId: 1, subetapaId: 14, tipoVehiculoId: null, diasObjetivo: 3, diasTolerancia: 1 },
      ];
      repo.find.mockResolvedValue(rules);

      const result = await service.resolve({ empresaId: 1, subetapaId: 14 });

      expect(result.id).toBe(2); // empresa + subetapa = score 2 > solo empresa = score 1
      expect(result.diasObjetivo).toBe(3);
    });

    it('debe retornar null si no hay reglas que apliquen', async () => {
      repo.find.mockResolvedValue([]);
      const result = await service.resolve({ empresaId: 999 });
      expect(result).toBeNull();
    });

    it('debe preferir empresa+subetapa sobre solo empresa', async () => {
      const rules: Partial<SlaConfig>[] = [
        { id: 1, empresaId: 1, subetapaId: null, tipoVehiculoId: null, diasObjetivo: 10, diasTolerancia: 5 },
        { id: 2, empresaId: 1, subetapaId: 5, tipoVehiculoId: null, diasObjetivo: 3, diasTolerancia: 1 },
      ];
      repo.find.mockResolvedValue(rules);

      const result = await service.resolve({ empresaId: 1, subetapaId: 5 });
      expect(result.id).toBe(2);
    });

    it('debe ignorar dimensiones que no coincidan con el contexto', async () => {
      const rules: Partial<SlaConfig>[] = [
        { id: 1, empresaId: 2, subetapaId: null, tipoVehiculoId: null, diasObjetivo: 10, diasTolerancia: 5 },
      ];
      repo.find.mockResolvedValue(rules);

      const result = await service.resolve({ empresaId: 1 });
      expect(result).toBeNull();
    });
  });

  describe('getStatus()', () => {
    const sla = { diasObjetivo: 5, diasTolerancia: 2 };

    it('debe retornar ok si dias <= diasObjetivo', () => {
      expect(service.getStatus(3, sla)).toBe('ok');
      expect(service.getStatus(5, sla)).toBe('ok');
    });

    it('debe retornar warning si dias <= diasObjetivo + diasTolerancia', () => {
      expect(service.getStatus(6, sla)).toBe('warning');
      expect(service.getStatus(7, sla)).toBe('warning');
    });

    it('debe retornar critico si dias > diasObjetivo + diasTolerancia', () => {
      expect(service.getStatus(8, sla)).toBe('critico');
      expect(service.getStatus(100, sla)).toBe('critico');
    });

    it('diasCritico debe ser diasObjetivo + diasTolerancia (NO debe leer de BD)', () => {
      // getStatus is a pure function — no DB calls
      const spy = jest.spyOn(repo, 'findOne');
      service.getStatus(10, sla);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
