import { Component, Input, signal, OnChanges, SimpleChanges } from '@angular/core';


function getDir(a: any, b: any) {
  return {
    dx: b.x - a.x,
    dy: b.y - a.y
  };
}

function makeSegment(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  return {
    left: x1,
    top: y1,
    width: Math.sqrt(dx * dx + dy * dy),
    angle: Math.atan2(dy, dx) * (180 / Math.PI)
  };
}

@Component({
  selector: 'app-laser',
  templateUrl: './laser.html',
  styleUrls: ['./laser.css']
})
export class Laser implements OnChanges {
  @Input() path: { x: number, y: number }[] = [];
  @Input() color: 'blue' | 'red' = 'red';
  @Input() static: boolean = false;

  columnas = 10;
  filas = 8;

  segments = signal<{ left: number; top: number; width: number; angle: number }[]>([]);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['path']) {
      this.updateSegments();
    }
  }

  

  updateSegments() {
    if (!this.path || this.path.length < 2) {
      this.segments.set([]);
      return;
    }

    const cellWpct = 100 / this.columnas; // % ancho por celda
    const cellHpct = 100 / this.filas;    // % alto por celda

    // Tamaño real en px de cada celda (para calcular longitudes correctas)
    const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
    const boardWpx = 95 * vmin;
    const boardHpx = 76 * vmin;
    const cellWpx = boardWpx / this.columnas;
    const cellHpx = boardHpx / this.filas;

    const toCenter = (p: { x: number, y: number }) => ({
      pctX: (p.x - 0.5) * cellWpct,  // posición en % para left/top
      pctY: (p.y - 0.5) * cellHpct,
      px: (p.x - 0.5) * cellWpx,     // posición en px para calcular longitud
      py: (p.y - 0.5) * cellHpx,
    });

    const segs = [];
    for (let i = 0; i < this.path.length - 1; i++) {
      const p1 = toCenter(this.path[i]);
      const p2 = toCenter(this.path[i + 1]);

      const dxPx = p2.px - p1.px;
      const dyPx = p2.py - p1.py;

      // Longitud real en px → convertir a % del ancho para width
      const lengthPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx);
      const widthPct = (lengthPx / boardWpx) * 100;

      segs.push({
        left: p1.pctX,
        top: p1.pctY,
        width: widthPct,
        angle: Math.atan2(dyPx, dxPx) * (180 / Math.PI)
      });
    }

    this.segments.set(segs);
  }
}