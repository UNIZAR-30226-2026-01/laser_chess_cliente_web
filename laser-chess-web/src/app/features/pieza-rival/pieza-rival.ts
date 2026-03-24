import { Component,  signal, input, SimpleChanges} from '@angular/core';



// pieza-rival.ts
@Component({
  selector: 'app-pieza-rival',
  standalone: true,
  templateUrl: './pieza-rival.html',
  styleUrl: './pieza-rival.css' // Puedes compartir el CSS
})
export class PiezaRival {
  x = input.required<number>();
  y = input.required<number>();
  rotation = input.required<number>();

  position = signal({ x: 0, y: 0 });

  ngOnInit() {
    // Al iniciar, colocamos la pieza en su sitio
    this.position.set({ x: this.x(), y: this.y() });
  
  }

  ngOnChanges(changes: SimpleChanges) {
    // Al iniciar, colocamos la pieza en su sitio
    if (changes['x'] || changes['y']) {
      this.position.set({ x: this.x(), y: this.y() });
    }
  
  }
}