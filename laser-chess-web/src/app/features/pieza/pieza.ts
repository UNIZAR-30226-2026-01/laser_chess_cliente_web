import { Component, signal,  input, output} from '@angular/core';

@Component({
  selector: 'app-pieza',
  standalone: true,
  imports: [], 
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
  
  selected = output<Pieza>();
  endMoved = output<void>();

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
  
  select() {
    this.showSpots.set(true);
    this.selected.emit(this);
  }

  move(dx: number, dy: number) {
    const { x, y } = this.position();
    const newX = x + dx;
    const newY = y + dy;

    if (newX >= 1 && newX <= this.cols() &&
        newY >= 1 && newY <= this.rows()) {
      this.position.set({ x: newX, y: newY });
    }
    this.showSpots.set(false);

    // Aviso al padre de que la pieza se ha movido para que oculte los botones
    this.endMoved.emit()
  }

  rotate(angle: number) {
    // Rotar la pieza
    this.rotation.update(prev => prev + angle);
    this.showSpots.set(false);
  }


}