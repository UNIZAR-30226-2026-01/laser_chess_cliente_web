import { Component, Signal, EventEmitter, Input, Output} from '@angular/core';
import { Pieza } from '../../shared/pieza/pieza';
import { PiezaRival } from '../../shared/pieza-rival/pieza-rival';
import { Laser } from '../../shared/laser/laser'
import { PiezaData } from '../../model/game/PiezaData';


@Component({
  selector: 'app-board',
  imports: [Pieza, PiezaRival, Laser],
  templateUrl: './board.html',
  styleUrl: './board.css',
})

export class Board {
  @Input() piezas!: Signal<PiezaData[]>;
  @Input() laserPath!: Signal<{x:number,y:number}[]>;

  @Output() piezaClick = new EventEmitter<Pieza>();
  @Output() casillaClick = new EventEmitter<{x:number,y:number}>();

}