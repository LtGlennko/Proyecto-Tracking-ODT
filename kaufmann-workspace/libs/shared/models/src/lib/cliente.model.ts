import { FichaModel } from './ficha.model';

export interface ClienteModel {
  id: string;
  name: string;
  isVic?: boolean;
  empresa: string;
  fichas: FichaModel[];
}
