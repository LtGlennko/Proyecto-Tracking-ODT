import { FichaModel } from './ficha.model';

export type Empresa = 'Divemotor' | 'Andes Motor' | 'Andes Maq';

export interface ClienteModel {
  id: string;
  name: string;
  isVic?: boolean;
  empresa: Empresa;
  fichas: FichaModel[];
}
