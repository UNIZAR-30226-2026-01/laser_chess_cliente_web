import { Component, HostListener, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChallengeResume } from '../../model/game/ChallengeResume';
import { NotificationService } from '../../model/notifications/notification'; // Para lo nuevo de las notificaciones
import { Remote } from '../../model/remote/remote';
import { Websocket } from '../../model/remote/websocket';
import { UserRespository } from '../../repository/user-respository';
import { TimerService } from '../../services/timer-service';
import { Board } from '../../shared/board/board';
import { Popup } from '../../shared/popups/popup';
import { TopRow } from '../../shared/top-row/top-row';
import { BoardState } from '../../utils/board-state';
import { GameState } from '../../utils/game-state';
import { GameUtils } from '../../utils/game-utils';



@Component({
  selector: 'app-home',
  imports: [ TopRow, MatIcon, Board, Popup],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // opciones de los selectores (no se si está guardado en algun otro lugar,
  // a si que lo pongo aqui)
  timeOptions = ['Blitz', 'Rapid', 'Classic', 'Extended'];
  // order must match backend Board_T enum: ACE(0), CURIOSITY(1), GRAIL(2), MERCURY(3), SOPHIE(4)
  boardOptions = ['Ace', 'Curiosity', 'Grail', 'Mercury', 'Sophie'];

  selectedTime = signal(this.timeOptions[0]);
  selectedBoard = signal(this.boardOptions[0]);

  // estado de los desplegables
  timeDropdownOpen = signal(false);
  boardDropdownOpen = signal(false);
  incrementDropdownOpen = signal(false);
  modeDropdownOpen = signal(false);

  eloDashOffset: number = 276.46;
  eloRankName: string = 'PROTON · II';
  rankedPoints: number = 1234;

  popUPNotis = signal(false);
  // valores internos: 'ranked', 'ia', 'public'
  tipoPartida = signal('public');
  
  // startingTime signal (in seconds)
  startingTime = signal(300);
  timeIncrement = signal(2);
  aiLevel = signal(1);
  aiLevelDropdownOpen = signal(false);

  boardState = inject(BoardState);
  columnas = 10;
  filas = 8;
  listaPiezas = this.boardState.listaPiezas;
  laserPath = this.boardState.laserPath;

  // Mapeo entre etiqueta y modos soportados por el backend (segundos)
  private timeModes: { [key: string]: { starting: number; increments: number[] } } = {
    'Blitz': { starting: 300, increments: [0, 2, 5] },
    'Rapid': { starting: 900, increments: [0, 5, 10] },
    'Classic': { starting: 1800, increments: [0, 10, 15] },
    'Extended': { starting: 3600, increments: [0, 15, 20] },
  };

  incrementOptions: number[] = [];


  solicitudes = signal<ChallengeResume[]>([]);
  private websocket = inject(Websocket);
  private wsSubscription: any;
  private remote = inject(Remote);

  private gameState = inject(GameState);
  private timerService = inject(TimerService);
  private userRepo = inject(UserRespository);
  gameUtils = inject(GameUtils);

  popUP_waiting = signal(false);

  cancelWaiting(){
    this.popUP_waiting.set(false);
    this.websocket.close();
  }

  constructor(private notificationService: NotificationService) {}

  // Cierra los desplegables si se hace clic fuera de ellos
  @HostListener('document:click')
  closeDropdowns() {
    this.timeDropdownOpen.set(false);
    this.boardDropdownOpen.set(false);
    this.incrementDropdownOpen.set(false);
    this.aiLevelDropdownOpen.set(false);
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

    // Inicializar opciones de incremento según el modo de tiempo seleccionado
    this.selectTime(this.selectedTime(), new Event('init'));
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
    this.closeDropdowns(); // Cierra otros desplegables abiertos
    this.timeDropdownOpen.set(!this.timeDropdownOpen());
  }

  toggleBoardDropdown(event: Event) {
    event.stopPropagation();
    this.closeDropdowns(); // Cierra otros desplegables abiertos
    this.boardDropdownOpen.set(!this.boardDropdownOpen());
  }

  selectTime(option: string, event: Event) {
    event.stopPropagation();
    this.selectedTime.set(option);
  
    this.timeDropdownOpen.set(false);

    const mode = this.timeModes[option];
    if (mode) {
      this.startingTime.set(mode.starting);
      this.incrementOptions = mode.increments;
      // escoger primer incremento por defecto
      this.timeIncrement.set(mode.increments.length > 0 ? mode.increments[0] : 0);
    }
  }

  toggleIncrementDropdown(event: Event) {
    event.stopPropagation();
    this.closeDropdowns(); // Cierra otros desplegables abiertos
    this.incrementDropdownOpen.set(!this.incrementDropdownOpen());
  }

  toggleAiLevelDropdown(event: Event) {
    event.stopPropagation();
    this.closeDropdowns();
    this.aiLevelDropdownOpen.set(!this.aiLevelDropdownOpen());
  }

  selectAiLevel(level: number, event: Event) {
    event.stopPropagation();
    this.aiLevel.set(level);
    this.aiLevelDropdownOpen.set(false);
  }

  selectIncrement(option: number, event: Event) {
    event.stopPropagation();
    this.timeIncrement.set(option);
    this.incrementDropdownOpen.set(false);
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

   // Rentaria desacoplar esto
  sendChallenge(): void {

    // Map selected board to backend Board_T numeric values
    let board = 0;
    switch (this.selectedBoard()) {
      case 'Ace':
        board = 0;
        break;
      case 'Curiosity':
        board = 1;
        break;
      case 'Grail':
        board = 2;
        break;
      case 'Mercury':
        board = 3;
        break;
      case 'Sophie':
        board = 4;
        break;
    }
    const timeIncrement = this.timeIncrement();
    const rawLevel = this.userRepo.getLevel() ?? 0;
    const level = Math.min(rawLevel, 3); // cap level to max 3
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
      case 'ranked':
        endpoint = 'matchmaking'
        params = {
            time_base: startingTime,
            time_increment: timeIncrement,
            board,
            ranked: 0,
          };
        break;
      case 'ia':
        endpoint = 'bot'
        params = {
            starting_time: startingTime,
            time_increment: timeIncrement,
            board,
            level: this.aiLevel() 
          };
        break;
      case 'public':
        endpoint = 'matchmaking'
        params = {
            board,
            time_base: startingTime,
            time_increment: timeIncrement,
            ranked: 1,
          };
        break;


    }
    ranked = params?.ranked ?? 0;
    this.timerService.miTiempo.set(startingTime * 1000);
    this.timerService.tiempoRival.set(startingTime * 1000);

    console.log('Parámetros' + startingTime);
    console.log("tiempo ini: " + startingTime + ", incremento:  " + timeIncrement + ", ranked: " + ranked + " nivel: " + level);

    this.popUP_waiting.set(true);
    this.websocket.initConnection(endpoint, params);


  }

}
