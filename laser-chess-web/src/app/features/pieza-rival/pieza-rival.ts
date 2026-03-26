import { Component,  signal, input, SimpleChanges} from '@angular/core';
import { TipoPieza } from '../../model/game/TipoPieza'



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
  rotationInput = input.required<number>();
  tipoPieza = input.required<TipoPieza>();
  interfazPieza: string = "";
  

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

    // Inicialización de la interfaz de la pieza, en función de tipoPieza
    switch(this.tipoPieza()){
        case TipoPieza.DEFLECTOR :
          this.interfazPieza = "assets/icons/red_deflector.png";
          break;
        case TipoPieza.ESCUDO :
          this.interfazPieza = "assets/icons/red_shield.png";
          break;
        case TipoPieza.LASER :
          this.interfazPieza = "assets/icons/red_lasser.png";
          break;
        case TipoPieza.REY :
          this.interfazPieza = "assets/icons/red_king.png";
          break;
        case TipoPieza.SWITCH :
          this.interfazPieza = "assets/icons/red_switch.png";       
          break;
    }
  
  }
}