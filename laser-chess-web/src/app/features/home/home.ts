import { Component, signal, inject, HostListener } from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';
import { ChallengeResume } from '../../model/game/ChallengeResume';
import { Websocket } from '../../model/remote/websocket';
import { Remote } from '../../model/remote/remote';
import { MatIcon } from '@angular/material/icon';
import { TimerService } from '../../services/timer-service';
import { UserRespository } from '../../repository/user-respository';
import { GameState } from '../../utils/game-state';

import { NotificationService } from '../../model/notifications/notification'; // Para lo nuevo de las notificaciones
import { Board } from '../../shared/board/board';
import { GameUtils } from '../../utils/game-utils';
import { BoardState } from '../../utils/board-state'



@Component({
  selector: 'app-home',
  imports: [ TopRow, MatIcon, Board],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // opciones de los selectores (no se si está guardado en algun otro lugar,
  // a si que lo pongo aqui)
  timeOptions = ['Blitz', 'Rapid', 'Classic', 'Extended'];
  boardOptions = ['Ace', 'Curiosity', 'Grail', 'Sophie', 'Mercury'];

  selectedTime = signal(this.timeOptions[0]);
  selectedBoard = signal(this.boardOptions[0]);

  // estado de los desplegables
  timeDropdownOpen = signal(false);
  boardDropdownOpen = signal(false);
  modeDropdownOpen = signal(false);

  eloDashOffset: number = 276.46;
  eloRankName: string = 'PROTON · II';
  rankedPoints: number = 1234;

  popUPNotis = signal(false);
  tipoPartida = signal('IA'); // Puede ser "Ranked", "IA", "Pública"
  
  timeIncrement = signal(2);

  boardState = inject(BoardState);
  columnas = 10;
  filas = 8;
  listaPiezas = this.boardState.listaPiezas;
  laserPath = this.boardState.laserPath;


  solicitudes = signal<ChallengeResume[]>([]);
  private websocket = inject(Websocket);
  private wsSubscription: any;
  private remote = inject(Remote);

  private gameState = inject(GameState);
  private timerService = inject(TimerService);
  private userRepo = inject(UserRespository);
  gameUtils = inject(GameUtils);

  constructor(private notificationService: NotificationService) {}

  // Cierra los desplegables si se hace clic fuera de ellos
  @HostListener('document:click')
  closeDropdowns() {
    this.timeDropdownOpen.set(false);
    this.boardDropdownOpen.set(false);
  }

  ngOnInit() {
    // Aquí podrías cargar las solicitudes iniciales si quieres
    
    this.loadFriends();
    this.getEloProgress();
    this.notificationService.wakeHome$.subscribe(() => {
        this.loadFriends();
        this.popUPNotis.set(true);
    });
    this.cargarTablero();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  cargarTablero(): void {
    this.boardState.listaPiezas.set([]);
    this.boardState.laserPath.set([]);

    // Una sola llamada, sin pasar por VACIO
    this.boardState.listaPiezas.set(this.boardState.iniciarTablero(this.selectedBoard().toUpperCase()));
  }

  toggleTimeDropdown(event: Event) {
    event.stopPropagation(); // Evita que se dispare el @HostListener
    this.timeDropdownOpen.set(!this.timeDropdownOpen());
    this.boardDropdownOpen.set(false); // Cierra el otro por si acaso
  }

  toggleBoardDropdown(event: Event) {
    event.stopPropagation();
    this.boardDropdownOpen.set(!this.boardDropdownOpen());
    this.timeDropdownOpen.set(false);
  }

  selectTime(option: string, event: Event) {
    event.stopPropagation();
    this.selectedTime.set(option);
  
    this.timeDropdownOpen.set(false);
  }

  selectBoard(option: string, event: Event) {
    event.stopPropagation();
    this.selectedBoard.set(option);
    this.boardState.currentBoard.set(option.toUpperCase());
    this.cargarTablero();
    this.boardDropdownOpen.set(false);
  }

  getEloProgress() {
    // Por ahora se pone un placeholder, pero habrá que calcularlo
    const porcentaje = 65;
    const circunferencia = 289.02;
    this.eloDashOffset = circunferencia - (porcentaje / 100) * circunferencia;
  }

  openNotifications() {
    this.loadFriends();
    this.popUPNotis.set(true);
  }

  loadFriends(): void {
      this.remote.checkSolicitudes().subscribe({
        next: (data : ChallengeResume[]) => {
        this.solicitudes.set(data);
        console.log('Solicitudes cargadas:', this.solicitudes);
        },
        error: (err : any) => {
          console.error('Error al cargar amigos:', err);
        }
      });
    }

    formatTime(milliseconds: number): string {
      const totalSeconds = Math.floor(milliseconds / 1000);

      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      if (minutes === 0) {
        return `${seconds}s`;
      }
      if (seconds > 0) {
        return `${minutes} min ${seconds}s`;
      }
      return `${minutes} min`;
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

    var board = 0;
    switch(this.selectedBoard()){
      case 'Ace':
        board= 0;
        break;
      case 'Curiosity':
        board= 1;
        break;
      case 'Grail':
        board= 2;
        break;
      case 'Sophie':
        board= 3;
        break;
      case 'Mercury':
        board= 4;
        break;
    }
    const timeIncrement = this.timeIncrement();
    const level = this.userRepo.getLevel();
    var ranked = 0;
    var startingTime = 0;
    switch(this.selectedTime()){
      case 'Blitz':
        startingTime = 300;
        break;
      case 'Rapid':
        startingTime = 900;
        break;
      case 'Classic':
        startingTime = 1800;
        break;
      case 'Extended':
        startingTime = 3600;
        break;
    }

    var endpoint = '';
    var params;
    switch(this.tipoPartida()){
      case 'Ranked':
        endpoint = 'matchmaking'
        params = {
            time_base: startingTime,
            time_increment: timeIncrement,
            board,
            ranked: 0,
          };
        break;
      case 'IA':
        endpoint = 'bot'
        params = {
            starting_time: startingTime,
            time_increment: timeIncrement,
            board,
            level: level
          };
        break;
      case 'Public':
        endpoint = 'matchmaking'
        params = {
            board,
            time_base: startingTime,
            time_increment: timeIncrement,
            ranked: 1,
          };
        break;


    }

    this.timerService.miTiempo.set(startingTime * 1000);
    this.timerService.tiempoRival.set(startingTime * 1000);

    console.log('Parámetros' + startingTime);
    console.log("tiempo ini: " + startingTime + ", incremento:  " + timeIncrement + ", ranked: " + ranked + " nivel: " + level);

    this.websocket.initConnection(endpoint, params);


  }

}
