import { Injectable, signal, inject} from '@angular/core';
import { PiezaData } from '../model/game/PiezaData'
import { GameUtils } from '../utils/game-utils'
import { TABLERO_ACE, TABLERO_CURIOSITY, TABLERO_GRAIL, TABLERO_SOPHIE, TABLERO_MERCURY } from '../constants/boards';
import { UserRespository } from '../repository/user-respository';


@Injectable({
  providedIn: 'root',
})
export class BoardState {
  listaPiezas = signal<PiezaData[]>([]);
  laserPath = signal<{x:number,y:number}[]>([]);

  currentBoard = signal('ACE');

  gameUtils = inject(GameUtils);
  userRepo = inject(UserRespository);

  //Hay que mirar esto bien
  skinUsario = signal(2);//signal(this.userRepo.getPieceSkin() ?? 0);
  skinRival = signal(0);


  iniciarTablero(board: string) : PiezaData[] {
    switch (board){
          case 'ACE':
            return this.gameUtils.importarTablero(TABLERO_ACE);
          case 'CURIOSITY':
            return this.gameUtils.importarTablero(TABLERO_CURIOSITY);
          case 'SOPHIE':
            return this.gameUtils.importarTablero(TABLERO_SOPHIE);
          case 'MERCURY':
            return this.gameUtils.importarTablero(TABLERO_MERCURY);
          case 'GRAIL': 
            return this.gameUtils.importarTablero(TABLERO_GRAIL);
          default:
            return [];
           
        }

  }
}
