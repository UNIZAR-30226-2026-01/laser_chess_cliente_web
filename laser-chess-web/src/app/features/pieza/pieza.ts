import { Component, signal,  input, output, SimpleChanges} from '@angular/core';

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
  cols = input(10);
  rows = input(8);
  moveRequested = output<{ x: number, y: number }>();

  
  selected = output<Pieza>();
  endMoved = output<{ origen: {x: number, y: number}, destino: {x: number, y: number} }>();

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

  ngOnChanges(changes: SimpleChanges) {
    // Al iniciar, colocamos la pieza en su sitio
    if (changes['initialX'] || changes['initialY']) {
      this.position.set({ x: this.initialX(), y: this.initialY() });
    }
  
  }
  
  select() {
    //this.showSpots.set(true);
    this.selected.emit(this);
  }

  solicitarMovimiento(nx: number, ny: number) {
    this.moveRequested.emit({ x: nx, y: ny });
  }


}