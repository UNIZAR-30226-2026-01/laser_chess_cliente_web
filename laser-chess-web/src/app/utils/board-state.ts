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
  skinUsario = signal(0);//signal(this.userRepo.getPieceSkin() ?? 0);
  skinRival = signal(0);

  boardBackgroundUrl = signal<string>('assets/vector-art/Backgrounds/Classic/BG-classic.svg');


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

  setPieceSkinFromItemId(itemId: number) {
  const map: Record<number, number> = {
    1: 0,   
    2: 2,   
    3: 1    
  };
  const newSkin = map[itemId];
  if (newSkin !== undefined && this.skinUsario() !== newSkin) {
    this.skinUsario.set(newSkin);
    this.refreshBoard();
  }
}

private refreshBoard() {
  const boardName = this.currentBoard(); 
  const nuevasPiezas = this.iniciarTablero(boardName);
  this.listaPiezas.set(nuevasPiezas);
}


 private boardSkinMap: Record<number, string> = {
    4: 'assets/vector-art/Backgrounds/Classic/BG-classic.svg',
    5: 'assets/vector-art/Backgrounds/Soretro/BG-soretro.svg',
    6: 'assets/vector-art/Backgrounds/Cats/BG-cats.svg'
  };

  setBoardSkinFromItemId(itemId: number) {
    const newUrl = this.boardSkinMap[itemId];
    if (newUrl && this.boardBackgroundUrl() !== newUrl) {
      this.boardBackgroundUrl.set(newUrl);
    }
  }

}
