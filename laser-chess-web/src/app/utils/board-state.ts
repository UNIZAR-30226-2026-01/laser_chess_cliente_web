import { Injectable, signal, inject, effect } from '@angular/core';
import { PiezaData } from '../model/game/PiezaData';
import { GameUtils } from '../utils/game-utils';
import {
  TABLERO_ACE,
  TABLERO_CURIOSITY,
  TABLERO_GRAIL,
  TABLERO_SOPHIE,
  TABLERO_MERCURY
} from '../constants/boards';

@Injectable({
  providedIn: 'root',
})
export class BoardState {

  // ======================
  // STATE
  // ======================
  listaPiezas = signal<PiezaData[]>([]);
  laserPath = signal<{ x: number; y: number }[]>([]);

  currentBoard = signal<string>('ACE');

  skinUsario = signal<number>(0);
  skinRival = signal<number>(1);
  laserColor = signal<'blue' | 'red'>('red');

  boardBackgroundUrl = signal<string>(
    'assets/vector-art/Backgrounds/Classic/BG-classic.svg'
  );

  // ======================
  // DEPENDENCIAS
  // ======================
  gameUtils = inject(GameUtils);

  // ======================
  // INIT REACTIVO
  // ======================
  constructor() {
    effect(() => {
      // dependencias reactivas
      const board = this.currentBoard();
      this.skinUsario();
      this.skinRival();

      this.buildBoard(board);
    });
  }

  initSkins(mySkin: number, rivalSkin: number = 1) {
    this.skinUsario.set(mySkin);
    this.skinRival.set(rivalSkin);
  }

  // ======================
  // CORE: construir tablero
  // ======================
  private buildBoard(board: string) {
    const piezas = this.iniciarTablero(board);
    this.listaPiezas.set(piezas);
  }

  // ======================
  // TABLEROS
  // ======================
  iniciarTablero(board: string): PiezaData[] {
    switch (board) {
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

  // ======================
  // SETTERS SIMPLES
  // ======================
  setPieceSkinFromItemId(itemId: number) {
    if (itemId !== undefined) {
      this.skinUsario.set(itemId);
    }
  }

  setRivalSkin(itemId: number) {
    if (itemId !== undefined) {
      this.skinRival.set(itemId);
    }
  }

  setBoard(board: string) {
    this.currentBoard.set(board);
  }

  setBoardSkinFromItemId(itemId: number) {
    const map: Record<number, string> = {
      4: 'assets/vector-art/Backgrounds/Classic/BG-classic.svg',
      5: 'assets/vector-art/Backgrounds/Soretro/BG-soretro.svg',
      6: 'assets/vector-art/Backgrounds/Cats/BG-cats.svg'
    };

    const url = map[itemId];
    if (url) {
      this.boardBackgroundUrl.set(url);
    }
  }
}