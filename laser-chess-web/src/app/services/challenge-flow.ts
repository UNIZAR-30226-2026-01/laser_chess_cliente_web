import { Injectable, inject, signal } from '@angular/core';
import { FriendSummary } from '../model/social/FriendSummary';
import { ChallengeManager } from './challenge-manager';
import { GameState } from '../utils/game-state';
import { Websocket } from '../model/remote/websocket';

export const TIME_MODES = [
  { id: 'blitz',    label: 'Blitz',         baseSeconds: 300,  increments: [0, 2, 5]   },
  { id: 'rapid',    label: 'Rapid',         baseSeconds: 900,  increments: [0, 5, 10]  },
  { id: 'classic',  label: 'Classic',       baseSeconds: 1800, increments: [0, 10, 15] },
  { id: 'extended', label: 'Extended',      baseSeconds: 3600, increments: [0, 15, 20] },
  { id: 'custom',   label: 'Personalizado', baseSeconds: null, increments: null        },
];

export const BOARDS = [
  { id: 1, name: 'ACE'      },
  { id: 2, name: 'CURIOSITY' },
  { id: 3, name: 'GRAIL'    },
  { id: 4, name: 'MERCURY'  },
  { id: 5, name: 'SOPHIE'   },
];

@Injectable({ providedIn: 'root' })
export class ChallengeFlowService {

  private challengeManager = inject(ChallengeManager);
  private gameState        = inject(GameState);
  private websocket        = inject(Websocket);

  // Constantes (readonly para que los componentes puedan bindearlas)
  readonly timeModes = TIME_MODES;
  readonly boards    = BOARDS;

  // Estado del popup de configuración
  showConfigPopup  = signal(false);
  friendToChallenge: FriendSummary | null = null;

  // Parámetros del reto
  selectedBoard     = signal<string>('ACE');
  selectedMode      = signal<any>(TIME_MODES[0]);
  selectedIncrement = signal<number>(0);
  customMinutes     = signal<number>(5);
  customIncrementSec = signal<number>(0);

  // Estado del popup de espera
  popUP_waiting = signal(false);

  // Abre el popup de configuración reseteando todos los valores
  openChallengeConfig(friend: FriendSummary): void {
    this.friendToChallenge = friend;
    this.selectedBoard.set('ACE');
    this.selectedMode.set(TIME_MODES[0]);
    this.selectedIncrement.set(0);
    this.customMinutes.set(5);
    this.customIncrementSec.set(0);
    this.showConfigPopup.set(true);
  }

  closeConfigPopup(): void {
    this.showConfigPopup.set(false);
    this.friendToChallenge = null;
  }

  onModeChange(mode: any): void {
    this.selectedMode.set(mode);
    if (mode.id !== 'custom') {
      this.selectedIncrement.set(mode.increments[0]);
    }
  }

  getChallengeParams(): { startingTime: number; timeIncrement: number } {
    const mode = this.selectedMode();
    if (mode.id === 'custom') {
      const minutes = Math.min(180, Math.max(1, this.customMinutes()));
      const inc     = Math.min(60,  Math.max(0, this.customIncrementSec()));
      return { startingTime: minutes * 60, timeIncrement: inc };
    }
    return { startingTime: mode.baseSeconds, timeIncrement: this.selectedIncrement() };
  }

  // Enviar reto (partida privada). Acepta un match_id opcional para reanudar partidas pausadas.
  sendChallenge(matchId: number | null = null): void {
    if (!this.friendToChallenge) return;

    const { startingTime, timeIncrement } = this.getChallengeParams();

    this.challengeManager.sendChallenge(
      this.selectedBoard(),
      startingTime,
      timeIncrement,
      'private',
      null,
      matchId,
      this.friendToChallenge.username
    );

    this.closeConfigPopup();
    this.popUP_waiting.set(true);
  }

  cancelWaiting(): void {
    this.websocket.close();
    this.popUP_waiting.set(false);
  }

  // Útil para que los componentes suscriban el cierre del waiting cuando el WS se cierra/falla
  handleChallengeCancelled(): void {
    if (this.popUP_waiting()) {
      this.popUP_waiting.set(false);
    }
  }
}
