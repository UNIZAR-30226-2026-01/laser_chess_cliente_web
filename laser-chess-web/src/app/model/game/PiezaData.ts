import { TipoPieza } from '../../model/game/TipoPieza'

export interface PiezaData {
  id: number;
  x: number;
  y: number;
  rotation: number;
  esMia: boolean;
  tipoPieza: TipoPieza;
}