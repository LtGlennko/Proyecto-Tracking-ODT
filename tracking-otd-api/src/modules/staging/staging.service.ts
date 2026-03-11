import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StagingVin } from './staging-vin.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class StagingService {
  private readonly uploadHistory: any[] = [];

  constructor(
    @InjectRepository(StagingVin)
    private repo: Repository<StagingVin>,
  ) {}

  parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const num = Number(value);
    if (!isNaN(num) && num > 40000) {
      const date = XLSX.SSF.parse_date_code(num);
      return new Date(date.y, date.m - 1, date.d);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  parseProped(fileBuffer: Buffer): Partial<StagingVin>[] {
    const wb = XLSX.read(fileBuffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws);

    return rows
      .filter(r => r['VIN'])
      .map(r => ({
        vin: String(r['VIN']).trim(),
        fechaColocacion: this.parseDate(r['FECHA DE COLOCACIÓN']),
        fechaLiberacionFabrica: this.parseDate(r['FECHA DE LIBERACIÓN']),
        etd: this.parseDate(r['ETD']),
        eta: this.parseDate(r['ETA']),
        fechaLlegadaAduana: this.parseDate(r['Llegada aduana tacna']),
        fechaRecojoCarrZcar: this.parseDate(r['FECHA RECOJO CARR (ZCAR)']),
        fechaIngresoProdCarrReal: this.parseDate(r['FECHA FINAL INGRESO PROD CARR']),
        fechaFinProdCarrReal: this.parseDate(r['FECHA FINAL DE PRODUCCION CARR (ZLIC)']),
        fechaIngresoProdCarrPlanif: this.parseDate(r['INGRESO LINEA PROD CARROCERO PLANIF']),
        fechaLibProdCarrPlanif: this.parseDate(r['LIBERACIÓN PROD CARROCERO PLANIF']),
        fechaFacturaComex: this.parseDate(r['FECHA FACTURA']),
        numFacturaComex: r['NUMERO FACTURA'],
        precioConfirmado: r['PRECIO CONFIRMADO'],
        pedidoInterno: r['PEDIDO INTERNO'],
        pedidoExterno: r['PEDIDO EXTERNO'],
        lineaNegocio: r['LINEA DE NEGOCIO'],
        carrocero: r['CARROCERO'],
        clienteComex: r['CLIENTE '],
        estadoComex: r['ESTADO'],
        modalidadEmbarque: r['MODALIDAD'],
        transportista: r['EMBARQUE'],
        remonta: r['REMONTA'],
        diasProdCarrPlanif: r['DIAS PROD PLANIF'],
        diasProdCarrReal: r['DIAS PROD REAL'],
        observacionesComex: r['Observaciones'],
        fuenteUltimaSync: 'PROPED',
        fechaSyncComex: new Date(),
      }));
  }

  parseSap(fileBuffer: Buffer): Partial<StagingVin>[] {
    const wb = XLSX.read(fileBuffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws);

    return rows
      .filter(r => r['Vin'])
      .map(r => ({
        vin: String(r['Vin']).trim(),
        loteAsignado: r['Lote.Asignado'],
        idFichaSap: r['Id.Ficha'],
        pedidoExterno: r['Pedido Externo'],
        pedidoVentaSap: r['Pedido Venta'],
        fechaEmbarqueSap: this.parseDate(r['Fecha Embarque']),
        fechaAduanaSap: this.parseDate(r['Fecha Aduana']),
        fechaLlegadaSap: this.parseDate(r['Fecha Llegada']),
        fechaIngresoPatio: this.parseDate(r['Fec.Ingreso Patio']),
        fechaLiberadoSap: this.parseDate(r['Fecha Liberado']),
        fechaPreasignacion: this.parseDate(r['Fecha Preasignación']),
        fechaAsignacion: this.parseDate(r['Fecha Asignación']),
        fechaFacturacionSap: this.parseDate(r['Fecha Facturación']),
        numFacturaSap: r['Num Factura'],
        fcc: this.parseDate(r['FCC']),
        fcr: this.parseDate(r['FCR']),
        fcl: this.parseDate(r['FCL']),
        fclr: this.parseDate(r['FCLR']),
        fechaEntregaCliente: this.parseDate(r['ENTREGA']),
        fechaEntregaReal: this.parseDate(r['Fecha Entr. Vend']),
        fechaEntregaPlanificada: this.parseDate(r['Fecha Entrega Pla.']),
        modeloComercial: r['Modelo Comercial'],
        modeloFacturacion: r['Modelo Facturación'],
        fechaNacion: this.parseDate(r['Fecha Nación']),
        numDeclaracion: r['N° Declaración'],
        nombreClienteSap: r['Descr.Cliente'],
        codClienteSap: r['Cliente'],
        codVendedor: r['Vendedor'],
        nombreVendedor: r['Descr.Vendedor'],
        statusCompraSap: r['Status Compra'],
        estadoFichaSap: r['Estados'],
        precioVentaPv: r['Precio Venta PV'],
        precioLista: r['Precio Lista'],
        sku: r['ZSKU'],
        matricula: r['Matr.vehículo'],
        fuenteUltimaSync: 'SAP',
        fechaSyncSap: new Date(),
      }));
  }

  async upsert(records: Partial<StagingVin>[], fuente: 'PROPED' | 'SAP'): Promise<{ inserted: number; updated: number }> {
    let inserted = 0, updated = 0;
    for (const rec of records) {
      const existing = await this.repo.findOne({ where: { vin: rec.vin } });
      if (existing) {
        // SAP does NOT overwrite etd/eta/fechaLlegadaAduana if PROPED already set them
        if (fuente === 'SAP') {
          if (existing.etd) delete rec['eta'];
          if (existing.fechaLlegadaAduana) delete rec['fechaLlegadaAduana'];
        }
        await this.repo.update({ vin: rec.vin }, rec);
        updated++;
      } else {
        await this.repo.save(this.repo.create(rec));
        inserted++;
      }
    }
    return { inserted, updated };
  }

  async getByVin(vinId: string): Promise<StagingVin> {
    return this.repo.findOne({ where: { vin: vinId } });
  }

  getHistory() { return this.uploadHistory; }
}
