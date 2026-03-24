export interface GameAction { // Adaptar a backend
  type: 'MOVE_PIECE' | 'SELECT_PIECE' | 'END_TURN';
  pieceId: number;
  from?: { x: number; y: number };
  to?: { x: number; y: number };
  playerId: string;
  rotation: number;
}