import { VinModel } from './vin.model';

export type FormaPago =
  | 'Renting'
  | 'Financiamiento directo'
  | 'Financiamiento BK'
  | 'Leasing'
  | 'Contado'
  | 'Otros';

export interface FichaModel {
  id: string;
  clientId?: string;
  clientName: string;
  dateCreated: string;
  executive: string;
  formaPago: FormaPago;
  vins: VinModel[];
}
