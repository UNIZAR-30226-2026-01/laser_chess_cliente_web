import { Component, signal, inject} from '@angular/core';
import { RouterLink } from "@angular/router";
import { TopRow } from '../../shared/top-row/top-row';
import { ChallengeResume } from '../../model/game/ChallengeResume';
import { Websocket } from '../../model/remote/websocket';
import { Remote } from '../../model/remote/remote';
import { GameState } from '../../model/remote/game-state'


@Component({
  selector: 'app-home',
  imports: [RouterLink, TopRow],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  username = 'User';
  pictureURL = '/assets/picture.jpeg';
  timeModeLabel = 'Modo de tiempo';
  boardPreviewUrl = '/assets/picture.jpeg';
  coins = 1234;
  rankedPoints = 1234;
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
  }
  
  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe(); 
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
    this.gameState.nombreRival.set(reto.challenger_username);

    this.websocket.initConnection(endpoint, params);
    this.popUPNotis.set(false);

  }
}
