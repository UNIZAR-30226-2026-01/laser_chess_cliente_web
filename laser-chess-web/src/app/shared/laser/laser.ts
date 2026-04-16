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
  columnas = 10;
  filas = 8;

  segments = signal<{ left: number; top: number; width: number; angle: number }[]>([]);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['path']) {
      this.updateSegments();
    }
  }

  

  updateSegments() {
    const segs: any[] = [];
    if (!this.path || this.path.length < 2) {
      this.segments.set([]);
      return;
    }

    const cellWidth = 100 / this.columnas;
    const cellHeight = 100 / this.filas;

    for (let i = 0; i < this.path.length - 1; i++) {
      const p1 = this.path[i];
      const p2 = this.path[i + 1];

      const x1 = (p1.x - 0.5) * cellWidth;
      const y1 = (p1.y - 0.5) * cellHeight;

      const x2 = (p2.x - 0.5) * cellWidth;
      const y2 = (p2.y - 0.5) * cellHeight;

      segs.push(makeSegment(x1, y1, x2, y2));
    }

    this.segments.set(segs);
  }
}