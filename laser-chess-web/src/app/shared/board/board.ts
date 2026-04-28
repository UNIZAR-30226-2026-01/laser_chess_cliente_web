import { Component, Signal, EventEmitter, Input, Output, inject} from '@angular/core';
import { Pieza } from '../../shared/pieza/pieza';
import { PiezaRival } from '../../shared/pieza-rival/pieza-rival';
import { Laser } from '../../shared/laser/laser'
import { PiezaData } from '../../model/game/PiezaData';
import { GameState } from '../../utils/game-state';


@Component({
  selector: 'app-board',
  imports: [Pieza, PiezaRival, Laser],
  templateUrl: './board.html',
  styleUrl: './board.css',
})

export class Board {
  state = inject(GameState);

  @Input() piezas!: Signal<PiezaData[]>;
  @Input() laserPath!: Signal<{x:number,y:number}[]>;

  @Input() columnas!: number;
  @Input() filas!: number;

  @Output() piezaSeleccionada = new EventEmitter<Pieza>();
  @Output() movimientoSolicitado = new EventEmitter<{x:number,y:number}>();

  @Input() isCasillaRestringida!: (x: number, y: number) => 'azul' | 'rojo' | null;
  @Input() ocupado!: (x: number, y: number) => PiezaData | null;

}