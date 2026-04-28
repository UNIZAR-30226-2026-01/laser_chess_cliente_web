import { Injectable, signal, inject} from '@angular/core';
import { PiezaData } from '../model/game/PiezaData'
import { GameUtils } from '../utils/game-utils'
import { ACE, CURIOSITY, GRAIL, SOPHIE, MERCURY } from '../constants/boards';
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
  skinUsario = signal(this.userRepo.getPieceSkin() ?? 0);
  skinRival = signal(0);


  iniciarTablero(board: string) : PiezaData[] {
    switch (board){
          case 'ACE':
            return this.gameUtils.importarTablero(ACE);
          case 'CURIOSITY':
            return this.gameUtils.importarTablero(CURIOSITY);
          case 'SOPHIE':
            return this.gameUtils.importarTablero(SOPHIE);
          case 'MERCURY':
            return this.gameUtils.importarTablero(MERCURY);
          case 'GRAIL': 
            return this.gameUtils.importarTablero(GRAIL);
          default:
            return [];
           
        }

  }
}
