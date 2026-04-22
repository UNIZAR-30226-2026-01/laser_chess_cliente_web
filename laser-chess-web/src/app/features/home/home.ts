import { Component, signal, inject} from '@angular/core';
import { RouterLink } from "@angular/router";
import { TopRow } from '../../shared/top-row/top-row';
import { ChallengeResume } from '../../model/game/ChallengeResume';
import { Websocket } from '../../model/remote/websocket';
import { Remote } from '../../model/remote/remote';
import { GameState } from '../../model/remote/game-state'
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-home',
  imports: [RouterLink, TopRow, MatIcon],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  timeModeLabel = 'Modo de tiempo';
  boardPreviewUrl = '/assets/picture.jpeg';

  eloDashOffset: number = 276.46;
  eloRankName: string = 'PROTON · II';
  rankedPoints: number = 1234;

  popUPNotis = signal(false);
  solicitudes = signal<ChallengeResume[]>([]);
  private websocket = inject(Websocket);
  private wsSubscription: any;
  private notificationService = inject(Remote);

  private gameState = inject(GameState);



  ngOnInit() {
    // Aquí podrías cargar las solicitudes iniciales si quieres
    this.websocket.checkAndReconnect();
    this.loadFriends();
    this.getEloProgress();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  getEloProgress() {
    // Por ahora se pone un placeholder, pero habrá que calcularlo
    const porcentaje = 65;
    const circunferencia = 289.02;
    this.eloDashOffset = circunferencia - (porcentaje / 100) * circunferencia;
  }

  loadFriends(): void {
      this.notificationService.checkSolicitudes().subscribe({
        next: (data : ChallengeResume[]) => {
        this.solicitudes.set(data);
        console.log('Solicitudes cargadas:', this.solicitudes);
        },
        error: (err : any) => {
          console.error('Error al cargar amigos:', err);
        }
      });
    }


  accept(reto: ChallengeResume) {
    const endpoint = 'challenge/accept';
    const params = {
      username: reto.challenger_username,
    };
    this.gameState.startingTime.set(reto.starting_time);
    this.gameState.increment.set(reto.time_increment);
    this.gameState.rivalName.set(reto.challenger_username);

    this.websocket.initConnection(endpoint, params);
    this.popUPNotis.set(false);

  }
}
