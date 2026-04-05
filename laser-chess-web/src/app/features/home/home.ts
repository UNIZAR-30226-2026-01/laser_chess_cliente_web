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
  solicitudes = signal<ChallengeResume[]>([]);
  private websocket = inject(Websocket);
  private wsSubscription: any;
  private router = inject(Router);
  private notificationService = inject(Remote);
  

  ngOnInit() {
    // Aquí podrías cargar las solicitudes iniciales si quieres
    this.loadFriends();     
  }
  
  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe(); 
  }



  loadFriends(): void {
      this.notificationService.checkSolicitudes().subscribe({
        next: (data : ChallengeResume[]) => {
        this.solicitudes.set(data);          console.log('Solicitudes cargadas:', this.solicitudes);
        },
        error: (err : any) => {
          console.error('Error al cargar amigos:', err);
        }
      });
    }
  

  accept(challenger_username: string) {
    const endpoint = 'challenge/accept';
    const params = {
      username: challenger_username,
    };

    this.websocket.initConnection(endpoint, params);

    if (this.wsSubscription) this.wsSubscription.unsubscribe();
    this.wsSubscription = this.websocket.gameMessages$.subscribe({
      next: (msg:  MessageGame) => {
        console.log('Mensaje recibido en Social (accept):', msg);
        this.popUPNotis.set(false);
        console.log("Entra a partida desde home (acepto reto)");
        

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
