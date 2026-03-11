export interface SubetapaConfigModel {
  id: number;
  hitoId: string;
  name: string;
  categoria: 'COMEX' | 'LOGISTICA' | 'COMERCIAL' | 'TALLER';
  orden: number;
  activo: boolean;
  diasObjetivo?: number;
}
