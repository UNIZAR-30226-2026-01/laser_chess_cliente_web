import { Component , signal, inject} from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';
import { TimerService } from '../../services/timer-service';
import { Board } from '../../shared/board/board';
import { GameLogicService } from '../../services/game-logic-service';
import { HistoryService } from '../../services/history-service';
import { GameUtils } from '../../utils/game-utils';

@Component({
  selector: 'app-history',
  imports: [TopRow, Board],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History {
  
  timerService = inject(TimerService);
  

  gameService = inject(GameLogicService);
  historyState = inject(HistoryService);
  gameUtils = inject(GameUtils);
  
  
  columnas = 10;
  filas = 8;
  listaPiezas = this.historyState.listaPiezas;
  laserPath = this.historyState.laserPath;


  miTiempo = this.historyState.miTiempo;
  tiempoRival = this.historyState.tiempoRival;

  nombreRival = this.historyState.nombreRival;
  miNombre = this.historyState.miNombre;

  miAvatar = this.historyState.miAvatar;
  rivalAvatar = this.historyState.rivalAvatar;

  
  
  ngOnInit(){
    const saved = localStorage.getItem('historyGame');
    if (saved) {
      this.historyState.historySelectedGame.set(JSON.parse(saved));
    }
    
    this.historyState.inicializarTablero();
  }
  siguiente(){
    this.historyState.avanzar();
  }
  anterior(){
    this.historyState.retroceder();
  }

  primero(){
    this.historyState.irAlPrimero();
  }
  ultimo(){
    this.historyState.irAlUltimo();
  }
}
