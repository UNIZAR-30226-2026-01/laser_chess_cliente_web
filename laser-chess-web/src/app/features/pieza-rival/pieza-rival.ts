import { Component,  signal, input} from '@angular/core';



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
  color = input.required<string>();

  position = signal({ x: 0, y: 0 });
}