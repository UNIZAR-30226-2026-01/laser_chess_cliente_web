import { Component , signal, inject} from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';
import { TimerService } from '../../model/remote/timer-service';
import { GameRepository } from '../../repository/game-repository';
import { Board } from '../../shared/board/board';
import { GameState } from '../../model/remote/game-state';
import { GameLogicService } from '../../model/remote/game-logic-service';

@Component({
  selector: 'app-history',
  imports: [TopRow, Board],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History {
  miTiempo = signal(0);
  tiempoRival = signal(0);

  timerService = inject(TimerService);
  miNombre = signal('');
  nombreRival = signal('')

  gameService = inject(GameLogicService);
  gameState = inject(GameState)
  
  listaPiezas = this.gameState.listaPiezas;
  laserPath = this.gameState.laserPath;

  columnas = 10;
  filas = 8;

}
