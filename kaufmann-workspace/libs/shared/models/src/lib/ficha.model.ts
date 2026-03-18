import { VinModel } from './vin.model';

export interface FichaModel {
  id: string;
  clientId?: string;
  clientName: string;
  dateCreated: string;
  executive: string;
  formasPago: string[];
  vins: VinModel[];
}
