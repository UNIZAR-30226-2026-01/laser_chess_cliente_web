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
  selectedPieza = signal<Pieza | null>(null);

  listaPiezas = signal([
    { id: 1, x: 4, y: 5, color:'red'}, // Una pieza en el centro aproximado
  ]);

  piezaActiva = signal<Pieza | null>(null);

  seleccionarPieza(pieza: Pieza) {
    if (this.piezaActiva()) {
      this.piezaActiva()?.showSpots.set(false);
    }

    if (this.piezaActiva() === pieza) {
      this.piezaActiva.set(null); // Si le das click de nuevo a la misma pieza
      this.piezaActiva()?.showSpots.set(false);
    } else {
      // Guardo la nueva pieza
      this.piezaActiva.set(pieza);
    }
  }

  deseleccionar() {
    this.piezaActiva.set(null);
  }
  rotateSelected(angle: number) {
    const pieza = this.piezaActiva();
    if (pieza) {
      pieza.rotate(angle);
      this.deseleccionar(); // Esto hará que los botones se oculten tras el giro
    }
  }
}
