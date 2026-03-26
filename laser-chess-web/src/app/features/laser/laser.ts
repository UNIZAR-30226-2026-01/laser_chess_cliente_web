import { Component, Input, computed} from '@angular/core';

@Component({
  selector: 'app-laser',
  imports: [],
  templateUrl: './laser.html',
  styleUrl: './laser.css',
})
export class Laser {
  // Lista de casillas que recorre el láser
  @Input() path: {x: number, y: number}[] = [];

  // computed es una función reactiva que se dispara cuando cambia el path
  pointsString = computed(() => {
    return this.path.map(p => {
      // Calculamos el centro de la celda en porcentaje
      const pctX = ((p.x - 1) * 10) + 5; 
      const pctY = ((p.y - 1) * 12.5) + 6.25;
      return `${pctX},${pctY}`;
    }).join(' ');
  });
}
