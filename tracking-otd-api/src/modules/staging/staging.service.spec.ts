import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StagingService } from './staging.service';
import { StagingVin } from './staging-vin.entity';
import * as XLSX from 'xlsx';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(dto => dto),
  update: jest.fn(),
});

// Helper to create a fake XLSX buffer from row data
function makeExcelBuffer(rows: any[]): Buffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

describe('StagingService', () => {
  let service: StagingService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StagingService,
        { provide: getRepositoryToken(StagingVin), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<StagingService>(StagingService);
    repo = module.get(getRepositoryToken(StagingVin));
  });

  describe('parseProped()', () => {
    it('debe mapear columnas del Excel PROPED a staging_vin correctamente', () => {
      const rows = [{
        'VIN': 'WDB9630321L123456',
        'FECHA DE COLOCACIÓN': '2024-01-15',
        'PEDIDO EXTERNO': 'PE-001',
        'LINEA DE NEGOCIO': 'Buses',
        'ESTADO': 'CONFIRMADO',
      }];
      const buffer = makeExcelBuffer(rows);
      const result = service.parseProped(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].vin).toBe('WDB9630321L123456');
      expect(result[0].pedidoExterno).toBe('PE-001');
      expect(result[0].lineaNegocio).toBe('Buses');
      expect(result[0].fuenteUltimaSync).toBe('PROPED');
    });

    it('debe ignorar filas sin VIN', () => {
      const rows = [
        { 'VIN': 'WDB111', 'ESTADO': 'OK' },
        { 'VIN': '', 'ESTADO': 'PENDIENTE' },
        { 'ESTADO': 'PENDIENTE' }, // no VIN key
      ];
      const buffer = makeExcelBuffer(rows);
      const result = service.parseProped(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].vin).toBe('WDB111');
    });

    it('debe parsear fechas en formato correcto', () => {
      const rows = [{
        'VIN': 'WDB9999999L000001',
        'FECHA DE COLOCACIÓN': '2024-03-15',
        'ETD': '2024-04-01',
      }];
      const buffer = makeExcelBuffer(rows);
      const result = service.parseProped(buffer);

      expect(result[0].fechaColocacion).toBeInstanceOf(Date);
      expect(result[0].etd).toBeInstanceOf(Date);
    });
  });

  describe('parseSap()', () => {
    it('debe mapear columnas del Excel SAP a staging_vin correctamente', () => {
      const rows = [{
        'Vin': 'WDB9630321L123456',
        'Lote.Asignado': 'LOTE-001',
        'Id.Ficha': 'F-2024-001',
        'Descr.Cliente': 'Toyota del Perú',
      }];
      const buffer = makeExcelBuffer(rows);
      const result = service.parseSap(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].vin).toBe('WDB9630321L123456');
      expect(result[0].loteAsignado).toBe('LOTE-001');
      expect(result[0].nombreClienteSap).toBe('Toyota del Perú');
      expect(result[0].fuenteUltimaSync).toBe('SAP');
    });

    it('no debe sobrescribir eta si ya existe valor de PROPED', async () => {
      const existing: Partial<StagingVin> = { vin: 'VIN1', etd: new Date('2024-03-10'), eta: new Date('2024-04-01') };
      repo.findOne.mockResolvedValue(existing);
      repo.update.mockResolvedValue({});

      const records = [{ vin: 'VIN1', eta: new Date('2024-05-01'), fuenteUltimaSync: 'SAP' }];
      await service.upsert(records as any, 'SAP');

      const updateCall = repo.update.mock.calls[0];
      // eta should be deleted from update payload when existing.etd is set
      expect(updateCall[1]).not.toHaveProperty('eta');
    });
  });

  describe('upsert()', () => {
    it('debe insertar VINs nuevos', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.save.mockResolvedValue({ vin: 'VIN_NUEVO' });

      const result = await service.upsert([{ vin: 'VIN_NUEVO' } as any], 'PROPED');

      expect(repo.save).toHaveBeenCalled();
      expect(result.inserted).toBe(1);
      expect(result.updated).toBe(0);
    });

    it('debe actualizar VINs existentes', async () => {
      repo.findOne.mockResolvedValue({ vin: 'VIN_EXIST', etd: null });
      repo.update.mockResolvedValue({});

      const result = await service.upsert([{ vin: 'VIN_EXIST', estadoComex: 'ACTUALIZADO' } as any], 'PROPED');

      expect(repo.update).toHaveBeenCalled();
      expect(result.updated).toBe(1);
      expect(result.inserted).toBe(0);
    });

    it('debe actualizar fuente_ultima_sync y fecha_sync_* correspondiente', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.save.mockImplementation(r => r);

      const records = [{ vin: 'VIN1', fuenteUltimaSync: 'PROPED', fechaSyncComex: new Date() } as any];
      await service.upsert(records, 'PROPED');

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ fuenteUltimaSync: 'PROPED' }),
      );
    });
  });
});
