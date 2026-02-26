import { Component, OnInit } from '@angular/core';

type Helix = 'red' | 'blue' | null;
/*
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
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit {

  readonly rows = 8;
  readonly cols = 10;

  cells: Cell[] = [];

  ngOnInit(): void {
    this.cells = this.buildBoard(this.rows, this.cols);
  }

  trackCell = (_: number, cell: Cell) => '${cell.f}-${cell.c}';

  private buildBoard(rows: number, cols: number): Cell[] {
    const cells: Cell[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const coord = this.toCoord(r, c, rows);

        const corner = (r == 0 || r == rows - 1) && (c == 0 || c == cols - 1);

        const helix = this.helixAt(r, c, rows, cols);

        cells.push({r, c, coord, helix, corner});
      }
    }
  }
}
*/