import { Component, signal,  input } from '@angular/core';

@Component({
  selector: 'app-pieza',
  standalone: true,
  imports: [], // ← aquí incluimos la directiva
  templateUrl: './pieza.html',
  styleUrls: ['./pieza.css'],
})
export class Pieza {
  // Recibimos la posición inicial y el tamaño desde el padre
  initialX = input.required<number>();
  initialY = input.required<number>();
  player = input.required<'red' | 'royalblue'>();
  cols = input(10);
  rows = input(8);
  

  // Posición de la pieza
  position = signal({ x: 0, y: 0 });

  // Señal para marcar como disponible el botón de girar
  moverDisp = signal(false);

  // Necesitaría un signal por componente o algún tipo de variable
  rotation = signal(0); // Ángulo de rotación en grados

  // Indica si los spots deben mostrarse
  showSpots = signal(false);


  ngOnInit() {
    // Al iniciar, colocamos la pieza en su sitio
    this.position.set({ x: this.initialX(), y: this.initialY() });
  
  }
  

  toggle() {
    this.showSpots.set(!this.showSpots());
    this.moverDisp.set(!this.moverDisp());
  }

  move(dx: number, dy: number) {
    const { x, y } = this.position();
    const newX = x + dx;
    const newY = y + dy;

    if (newX >= 1 && newX <= this.cols() &&
        newY >= 1 && newY <= this.rows()) {
      this.position.set({ x: newX, y: newY });
    }
    this.toggle();
  }

  rotate(angle: number) {
    // Rotar la pieza
    this.rotation.update(prev => prev + angle);
    this.toggle();
  }


}