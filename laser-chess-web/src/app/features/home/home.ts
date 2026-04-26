import { Component, signal, inject, HostListener } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TopRow } from '../../shared/top-row/top-row';
import { ChallengeResume } from '../../model/game/ChallengeResume';
import { Websocket } from '../../model/remote/websocket';
import { Remote } from '../../model/remote/remote';
import { GameState } from '../../utils/game-state'
import { MatIcon } from '@angular/material/icon';
import { TimerService } from '../../services/timer-service';



@Component({
  selector: 'app-home',
  imports: [RouterLink, TopRow, MatIcon],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // opciones de los selectores (no se si está guardado en algun otro lugar,
  // a si que lo pongo aqui)
  timeOptions = ['Blitz', 'Rapid', 'Classic', 'Extended'];
  boardOptions = ['Ace', 'Curiosity', 'Grail', 'Mercury', 'Sophie'];

  selectedTime = this.timeOptions[0];
  selectedBoard = this.boardOptions[0];

  // estado de los desplegables
  timeDropdownOpen = signal(false);
  boardDropdownOpen = signal(false);

  eloDashOffset: number = 276.46;
  eloRankName: string = 'PROTON · II';
  rankedPoints: number = 1234;

  popUPNotis = signal(false);
  solicitudes = signal<ChallengeResume[]>([]);
  private websocket = inject(Websocket);
  private wsSubscription: any;
  private notificationService = inject(Remote);

  private gameState = inject(GameState);
  private timerService = inject(TimerService);


  // Cierra los desplegables si se hace clic fuera de ellos
  @HostListener('document:click')
  closeDropdowns() {
    this.timeDropdownOpen.set(false);
    this.boardDropdownOpen.set(false);
  }

  ngOnInit() {
    // Aquí podrías cargar las solicitudes iniciales si quieres
    this.websocket.checkAndReconnect();
    this.loadFriends();
    this.getEloProgress();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
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
    this.selectedTime = option;
    this.timeDropdownOpen.set(false);
  }

  selectBoard(option: string, event: Event) {
    event.stopPropagation();
    this.selectedBoard = option;
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

    this.gameState.nombreRival.set(reto.challenger_username);

    this.websocket.initConnection(endpoint, params);
    this.popUPNotis.set(false);

  }

  solicitarPartida(){}
}
