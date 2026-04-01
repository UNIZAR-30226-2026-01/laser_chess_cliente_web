import { Component, signal, inject} from '@angular/core';
import { RouterLink } from "@angular/router";
import { TopRow } from '../../shared/top-row/top-row';
import { ChallengeResume } from '../../model/game/ChallengeResume';
import { MessageGame } from '../../model/game/MessageGame';
import { Websocket } from '../../model/remote/websocket';
import { Router } from '@angular/router';
import { Remote } from '../../model/remote/remote';

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
  solicitudes: ChallengeResume[] = [];
  private websocket = inject(Websocket);
  private wsSubscription: any;
  private router = inject(Router);
  private notificationService = inject(Remote);
  

  ngOnInit() {
    // Aquí podrías cargar las solicitudes iniciales si quieres
    this.loadFriends();     
  }

  loadFriends(): void {
      this.notificationService.checkSolicitudes().subscribe({
        next: (data : ChallengeResume[]) => {
          this.solicitudes = data;
          console.log('Solicitudes cargadas:', this.solicitudes);
        },
        error: (err : any) => {
          console.error('Error al cargar amigos:', err);
        }
      });
    }
  

  accept(challenger_id: number, board: number, challenger_username: string, starting_time: number, time_increment: number) {
    const endpoint = 'challenge/accept';
    const params = {
      username: challenger_username,
      board,
      starting_time,
      time_increment
    };

    this.websocket.connect(endpoint, params);

    if (this.wsSubscription) this.wsSubscription.unsubscribe();
    this.wsSubscription = this.websocket.gameMessages$.subscribe({
      next: (msg) => {
        console.log('Mensaje recibido en Social (accept):', msg);
        this.popUPNotis.set(false);
        this.websocket.close();
        this.router.navigate(['/game']);
      },
      error: (err) => {
        console.error('Error en WS Social (accept):', err);
        this.popUPNotis.set(false);
        this.websocket.close();
      }
    });
  }
}
