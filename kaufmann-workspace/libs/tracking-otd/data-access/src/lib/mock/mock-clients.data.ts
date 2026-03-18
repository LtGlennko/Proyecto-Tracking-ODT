import { ClienteModel, TipoVehiculoModel } from '@kaufmann/shared/models';
import { generateStages } from './mock-data.helpers';

// ── TipoVehiculo catalog objects ──
const TV_CAMION: TipoVehiculoModel     = { id: 1, nombre: 'Camión', slug: 'camion', color: '#2563eb' };
const TV_BUS: TipoVehiculoModel        = { id: 2, nombre: 'Bus', slug: 'bus', color: '#0ea5e9' };
const TV_MAQUINARIA: TipoVehiculoModel = { id: 3, nombre: 'Maquinaria', slug: 'maquinaria', color: '#f97316' };
const TV_VEH_LIGERO: TipoVehiculoModel = { id: 4, nombre: 'Vehículo Ligero', slug: 'vehiculo_ligero', color: '#a855f7' };

const stgDelayedVC    = generateStages('2025-10-15', 'delayed', 'camion');
const stgOntimeVC     = generateStages('2025-11-01', 'ontime', 'camion');
const stgOntimeBus    = generateStages('2025-10-20', 'ontime', 'bus');
const stgOntimeAutos  = generateStages('2026-01-10', 'ontime', 'vehiculo_ligero');
const stgFinishedAutos = generateStages('2025-09-01', 'ontime', 'vehiculo_ligero')
  .map(s => ({ ...s, status: 'completed' as const }));
const stgDelayedMaq   = generateStages('2025-12-01', 'delayed', 'maquinaria');
const stgDelayedBus   = generateStages('2025-11-20', 'delayed', 'bus');
const stgOntimeAutos2 = generateStages('2025-12-15', 'ontime', 'vehiculo_ligero');

export const MOCK_CLIENTS: ClienteModel[] = [
  {
    id: 'c1',
    name: 'Transportes del Norte S.A.',
    empresa: 'Divemotor',
    fichas: [
      {
        id: 'F-2025-884',
        clientId: 'c1',
        clientName: 'Transportes del Norte S.A.',
        dateCreated: '2025-10-20',
        executive: 'Juan Pérez',
        formasPago: ['Leasing'],
        vins: [
          {
            id: 'WDB9988776655AABC1',
            fichaId: 'F-2025-884',
            clientName: 'Transportes del Norte S.A.',
            tipoVehiculo: TV_CAMION,
            modelo: 'Mercedes-Benz Actros 2651',
            lote: 'LOTE-OCT-25',
            ordenCompra: 'OC-9912',
            estadoGeneral: 'DEMORADO',
            currentStageId: 'pdi',
            lastUpdate: '2026-03-09T10:00:00Z',
            daysDelayed: 6,
            stages: stgDelayedVC,
            diasVendedorComercial: 2,
            cumplimiento: 82,
          },
          {
            id: 'WDB9988776655AABC2',
            fichaId: 'F-2025-884',
            clientName: 'Transportes del Norte S.A.',
            tipoVehiculo: TV_CAMION,
            modelo: 'Mercedes-Benz Atego 1726',
            lote: 'LOTE-NOV-25',
            ordenCompra: 'OC-9913',
            estadoGeneral: 'A TIEMPO',
            currentStageId: 'inmatriculacion',
            lastUpdate: '2026-03-10T08:00:00Z',
            daysDelayed: 0,
            stages: stgOntimeVC,
            diasVendedorComercial: 1,
            cumplimiento: 96,
          },
        ],
      },
    ],
  },
  {
    id: 'c2',
    name: 'Turismo Andes S.A.',
    empresa: 'Andes Motor',
    fichas: [
      {
        id: 'F-2025-999',
        clientId: 'c2',
        clientName: 'Turismo Andes S.A.',
        dateCreated: '2025-11-05',
        executive: 'Roberto Gomez',
        formasPago: ['Financiamiento directo'],
        vins: [
          {
            id: 'WDBBUS44556601BUS1',
            fichaId: 'F-2025-999',
            clientName: 'Turismo Andes S.A.',
            tipoVehiculo: TV_BUS,
            modelo: 'Mercedes-Benz O 500 RSD',
            lote: 'LOTE-NOV-BUS',
            ordenCompra: 'OC-BUS-01',
            estadoGeneral: 'A TIEMPO',
            currentStageId: 'inmatriculacion',
            lastUpdate: '2026-03-10T06:00:00Z',
            daysDelayed: 0,
            stages: stgOntimeBus,
            diasVendedorComercial: 1,
            cumplimiento: 98,
          },
          {
            id: 'WDBBUS44556602BUS2',
            fichaId: 'F-2025-999',
            clientName: 'Turismo Andes S.A.',
            tipoVehiculo: TV_BUS,
            modelo: 'Mercedes-Benz O 500 RSD 2442',
            lote: 'LOTE-NOV-BUS',
            ordenCompra: 'OC-BUS-02',
            estadoGeneral: 'DEMORADO',
            currentStageId: 'credito',
            lastUpdate: '2026-03-09T14:00:00Z',
            daysDelayed: 4,
            stages: stgDelayedBus,
            diasVendedorComercial: 3,
            cumplimiento: 78,
          },
        ],
      },
    ],
  },
  {
    id: 'c3',
    name: 'Renting Corporativo S.A.C.',
    empresa: 'Divemotor',
    fichas: [
      {
        id: 'F-2025-901',
        clientId: 'c3',
        clientName: 'Renting Corporativo S.A.C.',
        dateCreated: '2025-10-01',
        executive: 'Maria Lopez',
        formasPago: ['Renting'],
        vins: [
          {
            id: 'JEEP1C4HJXEG8MW12345',
            fichaId: 'F-2025-901',
            clientName: 'Renting Corporativo S.A.C.',
            tipoVehiculo: TV_VEH_LIGERO,
            modelo: 'Jeep Commander',
            lote: 'LOTE-SEP-25',
            ordenCompra: 'OC-1004',
            estadoGeneral: 'FINALIZADO',
            currentStageId: 'entrega',
            lastUpdate: '2026-02-20T09:00:00Z',
            daysDelayed: -2,
            stages: stgFinishedAutos,
            diasVendedorComercial: 1,
            cumplimiento: 100,
          },
          {
            id: 'WDDXYZ9876512AUTO2',
            fichaId: 'F-2025-901',
            clientName: 'Renting Corporativo S.A.C.',
            tipoVehiculo: TV_VEH_LIGERO,
            modelo: 'Mercedes-Benz GLA 200',
            lote: 'LOTE-ENE-26',
            ordenCompra: 'OC-1005',
            estadoGeneral: 'A TIEMPO',
            currentStageId: 'programacion',
            lastUpdate: '2026-03-11T07:30:00Z',
            daysDelayed: 0,
            stages: stgOntimeAutos,
            diasVendedorComercial: 1,
            cumplimiento: 100,
          },
          {
            id: 'RAM1C6RR7LT3MN98765',
            fichaId: 'F-2025-901',
            clientName: 'Renting Corporativo S.A.C.',
            tipoVehiculo: TV_VEH_LIGERO,
            modelo: 'RAM 1500 Laramie',
            lote: 'LOTE-DIC-25',
            ordenCompra: 'OC-1006',
            estadoGeneral: 'A TIEMPO',
            currentStageId: 'credito',
            lastUpdate: '2026-03-10T11:00:00Z',
            daysDelayed: 0,
            stages: stgOntimeAutos2,
            diasVendedorComercial: 0,
            cumplimiento: 100,
          },
        ],
      },
    ],
  },
  {
    id: 'c4',
    name: 'Constructora del Sur S.A.',
    empresa: 'Andes Maq',
    fichas: [
      {
        id: 'F-MAQ-2025-01',
        clientId: 'c4',
        clientName: 'Constructora del Sur S.A.',
        dateCreated: '2025-12-10',
        executive: 'Carlos Ruiz',
        formasPago: ['Financiamiento BK'],
        vins: [
          {
            id: 'CATEXC330GC2025MAQ1',
            fichaId: 'F-MAQ-2025-01',
            clientName: 'Constructora del Sur S.A.',
            tipoVehiculo: TV_MAQUINARIA,
            modelo: 'Excavadora CAT 330 GC',
            lote: 'LOTE-DIC-25',
            ordenCompra: 'OC-MIN-55',
            estadoGeneral: 'DEMORADO',
            currentStageId: 'pdi',
            lastUpdate: '2026-03-11T08:30:00Z',
            daysDelayed: 5,
            stages: stgDelayedMaq,
            diasVendedorComercial: 4,
            cumplimiento: 73,
          },
        ],
      },
    ],
  },
  {
    id: 'c5',
    name: 'Transportes Línea S.A.',
    isVic: true,
    empresa: 'Andes Motor',
    fichas: [
      {
        id: 'F-BUS-2025-02',
        clientId: 'c5',
        clientName: 'Transportes Línea S.A.',
        dateCreated: '2025-11-15',
        executive: 'Ana Torres',
        formasPago: ['Leasing'],
        vins: [
          {
            id: 'WDBBUSLNEA001BUS001',
            fichaId: 'F-BUS-2025-02',
            clientName: 'Transportes Línea S.A.',
            tipoVehiculo: TV_BUS,
            modelo: 'Mercedes-Benz O 500 RSD 2442',
            lote: 'LOTE-DIC-BUS',
            ordenCompra: 'OC-LIN-101',
            estadoGeneral: 'FINALIZADO',
            currentStageId: 'entrega',
            lastUpdate: '2026-02-28T16:00:00Z',
            daysDelayed: 0,
            stages: generateStages('2025-09-15', 'ontime', 'bus').map(s => ({ ...s, status: 'completed' as const })),
            diasVendedorComercial: 0,
            cumplimiento: 100,
          },
        ],
      },
    ],
  },
];
