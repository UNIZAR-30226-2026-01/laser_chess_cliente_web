import { Component, signal,  input, output, SimpleChanges, OnChanges, OnInit} from '@angular/core';
import { TipoPieza } from '../../model/game/TipoPieza'

@Component({
  selector: 'app-pieza',
  standalone: true,
  imports: [], 
  templateUrl: './pieza.html',
  styleUrls: ['./pieza.css'],
})
export class Pieza implements OnInit, OnChanges{
  TipoPieza = TipoPieza; // Hacer visible el template para toda la componente
  
  // Recibimos la posición inicial y el tamaño desde el padre
  initialX = input.required<number>();
  initialY = input.required<number>();
  cols = input(10);
  rows = input(8);

  moveRequested = output<{ x: number, y: number }>();
  tipoPieza = input.required<TipoPieza>();
  interfazPieza: string = "";

  // Pieza seleccionada
  selected = output<Pieza>();

  // Posición de la pieza
  position = signal({ x: 0, y: 0 });

  // Señal para marcar como disponible el botón de girar
  moverDisp = signal(false);


  // Necesitaría un signal por componente o algún tipo de variable
  rotationInput = input.required<number>();

  // Indica si los spots deben mostrarse
  showSpots = signal(false);

  ngOnInit() {
    // Al iniciar, colocamos la pieza en su sitio
    this.position.set({ x: this.initialX(), y: this.initialY() });

    // Inicialización de la interfaz de la pieza, en función de tipoPieza
    switch(this.tipoPieza()){
        case TipoPieza.DEFLECTOR :
          this.interfazPieza = "assets/icons/blue_deflector.png";
          break;
        case TipoPieza.ESCUDO :
          this.interfazPieza = "assets/icons/blue_shield.png";
          break;
        case TipoPieza.LASER :
          this.interfazPieza = "assets/icons/blue_lasser.png";
          break;
        case TipoPieza.REY :
          this.interfazPieza = "assets/icons/blue_king.png";
          break;
        case TipoPieza.SWITCH :
          this.interfazPieza = "assets/icons/blue_switch.png";       
          break;
    }

    

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