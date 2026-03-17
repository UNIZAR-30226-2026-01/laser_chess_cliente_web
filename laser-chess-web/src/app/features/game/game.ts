import { Component, signal } from '@angular/core';
import { Pieza } from '../pieza/pieza'

type Helix = 'red' | 'blue' | null;

interface Cell {
  f: number;        // num. de filas
  c: number;        // num. de cols
  coord: string;    // tipo ajedrez: A1
  helix: Helix;
  corner: boolean;  // es una esquina?
}

const COLS = 'ABCDEFGHIJ';

@Component({
  selector: 'app-game',
  imports: [Pieza],
  templateUrl: './game.html',
  styleUrl: './game.css',
})

export class Game {
  columnas = 10;
  filas = 8;

  listaPiezas = signal([
    { id: 1, x: 4, y: 5, color:'red'}, // Una pieza en el centro aproximado
  ]);
}
