import { Component, signal, inject} from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';
import { ChallengeResume } from '../../model/game/ChallengeResume';
import { Websocket } from '../../model/remote/websocket';
import { Remote } from '../../model/remote/remote';
import { GameState } from '../../utils/game-state'
import { MatIcon } from '@angular/material/icon';
import { TimerService } from '../../services/timer-service';
import { UserRespository } from '../../repository/user-respository';



@Component({
  selector: 'app-home',
  imports: [ TopRow, MatIcon],
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
  tipoPartida = signal('IA'); // Puede ser "Ranked", "IA", "Pública"
  selectedBoard = signal(0);
  startingTime = signal(300);
  timeIncrement = signal(0);


  solicitudes = signal<ChallengeResume[]>([]);
  private websocket = inject(Websocket);
  private wsSubscription: any;
  private notificationService = inject(Remote);

  private gameState = inject(GameState);
  private timerService = inject(TimerService);
  private userRepo = inject(UserRespository);



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
    console.log('Aceptando reto de:', reto.challenger_username);
    

    this.timerService.miTiempo.set(reto.starting_time);
    this.timerService.tiempoRival.set(reto.starting_time);
    
    this.gameState.miNombre.set(this.userRepo.getUsername() || '');
    this.gameState.nombreRival.set(reto.challenger_username);
    console.log('Jugadores: ' + this.gameState.miNombre() + ' vs ' + this.gameState.nombreRival());

    this.websocket.initConnection(endpoint, params);
    this.popUPNotis.set(false);

  }

   // Inciiar a una partida amistosa DESAFIAR
  sendChallenge(): void {

    const board = this.selectedBoard();
    const startingTime = this.startingTime();
    const timeIncrement = this.timeIncrement();
    const level = this.userRepo.getLevel();

    var endpoint = '';
    var params;
    switch(this.tipoPartida()){
      case 'Ranked':
        endpoint = 'matchmaking'
        params = {
            board,
            starting_time: startingTime,
            time_increment: timeIncrement,
            ranked: 1,
          };
        break;
      case 'IA':
        endpoint = 'bot'
        params = {
            board,
            starting_time: startingTime,
            time_increment: timeIncrement,
            level: level
          };
        break;
    
    }

    
    
    this.timerService.miTiempo.set(startingTime * 1000);
    this.timerService.tiempoRival.set(startingTime * 1000);

    console.log('Parámetros' + startingTime);
    console.log("tiempo ini: " + startingTime + ", incremento:  " + timeIncrement );

    this.websocket.initConnection(endpoint, params);
    

  }

}
