import { Component, Input, signal, OnChanges, SimpleChanges } from '@angular/core';

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

      // Centrar el láser en la celda
      const x1 = (p1.x - 0.5) * cellWidth;
      const y1 = (p1.y - 0.5) * cellHeight;

      const x2 = (p2.x - 0.5) * cellWidth;
      const y2 = (p2.y - 0.5) * cellHeight;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      segs.push({ left: x1, top: y1, width: length, angle });
    }

    this.segments.set(segs);
  }
}