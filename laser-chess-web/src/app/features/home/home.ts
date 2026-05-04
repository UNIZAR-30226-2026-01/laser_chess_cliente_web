import { Component, HostListener, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ChallengeResume } from '../../model/game/ChallengeResume';
import { NotificationService } from '../../model/notifications/notification'; // Para lo nuevo de las notificaciones
import { GameRepository } from '../../repository/game-repository';
import { Board } from '../../shared/board/board';
import { Popup } from '../../shared/popups/popup';
import { TopRow } from '../../shared/top-row/top-row';
import { BoardState } from '../../utils/board-state';
import { GameUtils } from '../../utils/game-utils';
import { ChallengeManager } from '../../services/challenge-manager';
import { TIMEMODE_TO_MINS } from '../../constants/time.mode'
import { UserRespository } from '../../repository/user-respository';
import { FriendRespository } from '../../repository/friend-respository';



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
  private wsSubscription: any;
  private gameRepo = inject(GameRepository);

  
  private challengeManager = inject(ChallengeManager);
  private userRepo = inject(UserRespository)
  private friendRepo = inject(FriendRespository)
  gameUtils = inject(GameUtils);

  popUP_waiting = signal(false);

  cancelWaiting(){
    this.popUP_waiting.set(false);
    this.challengeManager
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
    
    this.loadRequest();
    this.getEloProgress();
    this.notificationService.wakeHome$.subscribe(() => {
        this.loadRequest();
    });
    this.boardState.skinRival.set(1);
    this.userRepo.getOwnAccount().subscribe(profile => {
      this.boardState.skinUsario.set(profile.piece_skin);
    });
    this.cargarTablero();
    this.friendRepo.getFriends().subscribe();

    

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
    this.loadRequest();
    this.popUPNotis.set(true);
  }

  loadRequest(): void {
    this.gameRepo.getChallengeRequest().subscribe({
      next: (data : ChallengeResume[]) => {
      this.solicitudes.set([...data]);
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
    this.challengeManager.accept(reto)
    this.popUPNotis.set(false);

  }

  reject(reto: ChallengeResume) {
    this.challengeManager.reject(reto);
    this.loadRequest();

    this.popUPNotis.set(false);

  }

  sendChallenge(): void {
    this.challengeManager.sendChallenge(this.selectedBoard(), TIMEMODE_TO_MINS[this.selectedTime()], this.timeIncrement(), this.tipoPartida(), this.aiLevel(), null, null);
    this.popUP_waiting.set(true);
  }

}
