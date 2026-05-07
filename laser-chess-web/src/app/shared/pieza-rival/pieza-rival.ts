import { Component,  signal, input, SimpleChanges, inject, effect} from '@angular/core';
import { TipoPieza } from '../../model/game/TipoPieza'
import { BoardState } from '../../utils/board-state'




// pieza-rival.ts
@Component({
  selector: 'app-pieza-rival',
  standalone: true,
  templateUrl: './pieza-rival.html',
  styleUrl: './pieza-rival.css' // Puedes compartir el CSS
})
export class PiezaRival {
  boardState = inject(BoardState);

  x = input.required<number>();
  y = input.required<number>();
  rotationInput = input.required<number>();
  tipoPieza = input.required<TipoPieza>();
  interfazPieza: string = "";
  skin = this.boardState.skinRival;
  

  position = signal({ x: 0, y: 0 });

  constructor() {
    effect(() => {
      this.skin();
      this.actualizarInterfaz();
    });
  }

  ngOnInit() {
    // Al iniciar, colocamos la pieza en su sitio
    this.position.set({ x: this.x(), y: this.y() });

    // Inicialización de la interfaz de la pieza, en función de tipoPieza
    this.actualizarInterfaz();

    

  }

  ngOnChanges(changes: SimpleChanges) {
    // Al iniciar, colocamos la pieza en su sitio
    if (changes['x'] || changes['y']) {
      this.position.set({ x: this.x(), y: this.y() });
      this.actualizarInterfaz();
    }
  
  }
  
  actualizarInterfaz() {
    switch(this.skin()){
      case 1: 
        switch(this.tipoPieza()) {
            case TipoPieza.DEFLECTOR: this.interfazPieza = "assets/vector-art/PieceSets/Classic/DEF-R-Classic.svg"; break;
            case TipoPieza.ESCUDO:    this.interfazPieza = "assets/vector-art/PieceSets/Classic/ESC-R-Classic.svg";    break;
            case TipoPieza.LASER:     this.interfazPieza = "assets/vector-art/PieceSets/Classic/LAS-R-Classic.svg";    break;
            case TipoPieza.REY:       this.interfazPieza = "assets/vector-art/PieceSets/Classic/KIN-R-Classic.svg";      break;
            case TipoPieza.SWITCH:    this.interfazPieza = "assets/vector-art/PieceSets/Classic/SWI-R-Classic.svg";    break;
          }
        break;
      case 2:
        switch(this.tipoPieza()) {
            case TipoPieza.DEFLECTOR: this.interfazPieza = "assets/vector-art/PieceSets/Soretro/DEF-R-Soretro.png"; break;
            case TipoPieza.ESCUDO:    this.interfazPieza = "assets/vector-art/PieceSets/Soretro/ESC-R-Soretro.png";    break;
            case TipoPieza.LASER:     this.interfazPieza = "assets/vector-art/PieceSets/Soretro/LAS-R-Soretro.png";    break;
            case TipoPieza.REY:       this.interfazPieza = "assets/vector-art/PieceSets/Soretro/KIN-R-Soretro.png";      break;
            case TipoPieza.SWITCH:    this.interfazPieza = "assets/vector-art/PieceSets/Soretro/SWI-R-Soretro.png";    break;
          }
        break;
      case 3:
        switch(this.tipoPieza()) {
            

            case TipoPieza.DEFLECTOR: this.interfazPieza = "assets/vector-art/PieceSets/Cats/DEF-R-Cats.svg"; break;
            case TipoPieza.ESCUDO:    this.interfazPieza = "assets/vector-art/PieceSets/Cats/ESC-R-Cats.svg";    break;
            case TipoPieza.LASER:     this.interfazPieza = "assets/vector-art/PieceSets/Cats/LAS-R-Cats.svg";    break;
            case TipoPieza.REY:       this.interfazPieza = "assets/vector-art/PieceSets/Cats/KIN-R-Cats.svg";      break;
            case TipoPieza.SWITCH:    this.interfazPieza = "assets/vector-art/PieceSets/Cats/SWI-R-Cats.svg";    break;
          }
        break;
    }
    
  }
}