import { Component, inject } from '@angular/core';
import { Popup } from '../popups/popup';
import { ChallengeFlowService } from '../../services/challenge-flow';

/**
 * Encapsula los dos popups compartidos entre Social y Ranking:
 *   - challengeConfig  (configurar parámetros del reto)
 *   - waiting          (esperando respuesta del rival)
 *
 * Uso: añadir <app-challenge-flow> una sola vez en el HTML del componente padre.
 * El padre debe inyectar ChallengeFlowService para llamar a openChallengeConfig().
 */
@Component({
  selector: 'app-challenge-flow',
  standalone: true,
  imports: [Popup],
  template: `
    <app-popup
      [type]="flow.showConfigPopup() ? 'challengeConfig' : 'none'"
      [challengeFriendUsername]="flow.friendToChallenge?.username || null"
      [challengeBoards]="flow.boards"
      [challengeSelectedBoard]="flow.selectedBoard()"
      [challengeTimeModes]="flow.timeModes"
      [challengeSelectedMode]="flow.selectedMode()"
      [challengeSelectedIncrement]="flow.selectedIncrement()"
      [challengeCustomMinutes]="flow.customMinutes()"
      [challengeCustomIncrementSec]="flow.customIncrementSec()"
      (challengeConfigClose)="flow.closeConfigPopup()"
      (challengeModeChange)="flow.onModeChange($event)"
      (challengeSelectedBoardChange)="flow.selectedBoard.set($event)"
      (challengeSelectedIncrementChange)="flow.selectedIncrement.set(+$event)"
      (challengeCustomMinutesChange)="flow.customMinutes.set(+$event)"
      (challengeCustomIncrementSecChange)="flow.customIncrementSec.set(+$event)"
      (challengeSend)="flow.sendChallenge()">
    </app-popup>

    <app-popup
      [type]="flow.popUP_waiting() ? 'waiting' : 'none'"
      (waitingCancel)="flow.cancelWaiting()">
    </app-popup>
  `,
})
export class ChallengeFlow {
  flow = inject(ChallengeFlowService);
}