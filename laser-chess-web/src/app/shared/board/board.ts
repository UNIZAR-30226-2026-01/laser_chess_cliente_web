import { Component, Signal, EventEmitter, Input, Output, inject} from '@angular/core';
import { Pieza } from '../../shared/pieza/pieza';
import { PiezaRival } from '../../shared/pieza-rival/pieza-rival';
import { Laser } from '../../shared/laser/laser'
import { PiezaData } from '../../model/game/PiezaData';
import { GameState } from '../../utils/game-state';
import { BoardState } from '../../utils/board-state';


@Component({
  selector: 'app-board',
  imports: [Pieza, PiezaRival, Laser],
  templateUrl: './board.html',
  styleUrl: './board.css',
})

export class Board {
  gameState = inject(GameState);
  boardState = inject(BoardState);

  @Input() piezas!: Signal<PiezaData[]>;
  @Input() laserPath!: Signal<{x:number,y:number}[]>;

  @Input() columnas!: number;
  @Input() filas!: number;

  @Output() piezaSeleccionada = new EventEmitter<Pieza>();
  @Output() movimientoSolicitado = new EventEmitter<{x:number,y:number}>();

  @Input() isCasillaRestringida!: (x: number, y: number) => 'azul' | 'rojo' | null;
  @Input() ocupado!: (x: number, y: number) => PiezaData | null;

  



  getRuneUrl(tipoRuna: 'B' | 'R'): string {
    // Obtenemos la ruta del background activo
    const bgUrl = this.boardState.boardBackgroundUrl() || '';

    // NOTA: Ajusta el prefijo 'assets/' si tu carpeta de assets está estructurada distinto.
    const basePath = 'assets/vector-art/Backgrounds';

    if (bgUrl.includes('Cats')) {
      return `url('${basePath}/Cats/Rune-${tipoRuna}-Cats.svg')`;

    } else if (bgUrl.includes('Soretro')) {
      return `url('${basePath}/Soretro/Rune-${tipoRuna}-Soretro.png')`;

    } else {
      return `url('${basePath}/Classic/Rune-${tipoRuna}-Classic.svg')`;
    }
  }
}
