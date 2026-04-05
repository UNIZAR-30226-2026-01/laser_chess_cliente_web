import { Component, inject, ElementRef, ViewChild} from '@angular/core';
import { signal } from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';
import { Router } from '@angular/router';
import { FriendSummary } from '../../model/social/FriendSummary'
import { Remote } from '../../model/remote/remote';
import { FriendshipRequest } from '../../model/social/FriendshipRequest';
import { Websocket } from '../../model/remote/websocket';          // para lo nuevo del weboscket
import { MessageGame } from '../../model/game/MessageGame'

import { FormsModule } from '@angular/forms';


import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';

@Component({
  selector: 'app-social',
  imports: [TopRow, FormsModule],
  templateUrl: './social.html',
  styleUrl: './social.css',
})


export class Social  {
  username = 'User';
  pictureURL = '/assets/picture.jpeg';
  timeModeLabel = 'Modo de tiempo';
  boardPreviewUrl = '/assets/picture.jpeg';
  coins = 1234;
  rankedPoints = 1234;
  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;

  // Llamada a remote para obtener datos

  public popUP_newFriend = signal(false);
  public popUP_request = signal(false);
  public state = signal(true); // State == true -> Social, State == false -> In Progress

  friends = signal<FriendSummary[]>([]); // Lista de amigos del usuario
  request = signal<FriendSummary[]>([]); 
  sentRequests = signal<FriendSummary[]>([]);  // Lista solicitudes enviadas pendientes


  private friendService = inject(Remote);
  private router = inject(Router);
  public friendsInfo = signal(false);
  public requestInfo = signal(false);
  public popUP_userInfo = signal(false);
  public selectedUser: FriendSummary | null = null;
  public requestTabState = signal<'received' | 'sent'>('received'); //Para diferenciar entre enviadas y recibidas
  public sentRequestsInfo = signal(false);

  //PARA LA CONFIGURACION DE LA PARTIDA
  // Popup de configuración de las partidas
  public showConfigPopup = signal(false);
  public friendToChallenge: FriendSummary | null = null;
  
  // Modos de tiempo disponibles (es lo que pone en la documentacion de los elegido)
  public timeModes = [
    { id: 'blitz', label: 'Blitz', baseSeconds: 300, increments: [0, 2, 5] },
    { id: 'rapid', label: 'Rapid', baseSeconds: 900, increments: [0, 5, 10] },
    { id: 'classic', label: 'Classic', baseSeconds: 1800, increments: [0, 10, 15] },
    { id: 'extended', label: 'Extended', baseSeconds: 3600, increments: [0, 15, 20] },
    { id: 'custom', label: 'Personalizado', baseSeconds: null, increments: null }
  ];
  public boards = [
    { id: 1, name: 'ACE' },
    { id: 2, name: 'CURIOSITY' },
    { id: 3, name: 'GRAIL' },
    { id: 4, name: 'MERCURY' },
    { id: 5, name: 'SOPHIE' }
  ];
  public selectedBoard = signal<number>(1); // ACE por defecto
  public selectedMode = signal<any>(this.timeModes[0]); // Blitz por defecto
  public selectedIncrement = signal<number>(0); // incremento en segundos
  

  // Solo para modo personalizado
  public customMinutes = signal<number>(5);
  public customIncrementSec = signal<number>(0);

  //WEBSOCKET
  public popUP_waiting = signal(false);// Para el nuevo pop-up del ESPERANDO
  private websocket = inject(Websocket);// Para meter el websocket en social
  private wsSubscription: any;//Para limpiar la sub del socket despues

  ngOnInit(): void {
      this.loadFriends();
      this.loadRequests(); // Claro, sin esto no iba a ir de primeras ver las pendientes. Solo se veian despues de hacer click en el botn
      this.loadSentRequests(); 
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe(); 
  }


  // Cancelar la espera y cerrar WebSocket
  cancelWaiting(): void {
    this.websocket.close();
    this.popUP_waiting.set(false);
  }

  onArrowClick() {
    // Llamada al backend para obetener solicitudes de amistad?
    console.log('Arrow clicked');
    // Redirigir a pantalla de solicitudes de amistad
  }

  nuevoAmigo(){
    console.log('Abrir pop-up para introducir datos de nuevo amigo');
    this.popUP_newFriend.set(true);
  }

  // Abrir pop-up de solicitudes
  openRequestPopup() {
    this.loadRequests();
    this.loadSentRequests(); 
    this.requestTabState.set('received'); //?
    this.popUP_request.set(true);
  }

  // abrir pop-up con información del usuario
  openUserInfo(user: FriendSummary) {
    this.selectedUser = user;
    this.popUP_userInfo.set(true);
      if (user.userId) {
      const userIdNumber = Number(user.userId);
      this.friendService.getAllRatings(userIdNumber).subscribe({
        next: (ratings: AllRatingsDTO) => {
          if (this.selectedUser && this.selectedUser.username === user.username) {
            this.selectedUser.blitzElo = ratings.blitz;
            this.selectedUser.rapidElo = ratings.rapid;
            this.selectedUser.classicElo = ratings.classic;
            this.selectedUser.extendedElo = ratings.extended;
          }
        },
        error: (err) => {
          console.error('Error al obtener ELOs:', err);
        }
      });
    } else {
      console.warn('El usuario no tiene ID, no se pueden obtener ELOs');
    }
  }

  // Cerrar pop-up de información
  closeUserInfo() {
    this.popUP_userInfo.set(false);
    this.selectedUser = null;
  }

  // Cambiar en el popup de solicitudes
  setRequestTab(tab: 'received' | 'sent') {
    this.requestTabState.set(tab);
  }

  copyLink() {
    console.log('Copiar enlace');
  }
  
  //Volver a la partida si hay un ID de partida específico lo usaremos mas adelante pero de momento con navegar sirve
  resumeGame(gameId?: string) {
    console.log('Retomando partida...');
    this.router.navigate(['/game']); 
  }

  //Cargar lista de amigos
  loadFriends(): void {
    this.friendService.getFriends().subscribe({
      next: (data : FriendSummary[]) => {
        this.friends.set(data || []);
        console.log('Amigos cargados:', this.friends);
        this.friendsInfo.set(true);
      },
      error: (err : any) => {
        console.error('Error al cargar amigos:', err);
      }
    });
  }

  //Cargar solicitudes de amistad recibidas
  loadRequests(): void {
    this.requestInfo.set(false);
    this.friendService.getRequestFriends().subscribe({
      next: (data:FriendSummary[]) => {
        console.log('Solicitudes de amistad disponibles:', data);
        this.request.set(data || []);
        this.requestInfo.set(true);
      },
      error: (err:any) => {
        console.error('Error al cargar solicitudes:', err);
        this.requestInfo.set(true);
      }
    });
  }

  //Load sentRequest
  loadSentRequests(): void {
    this.sentRequestsInfo.set(false);
    this.friendService.getSentRequests().subscribe({
      next: (data: FriendSummary[]) => {
        console.log('Solicitudes de amistad enviadas:', data);
        this.sentRequests.set(data || []);
        this.sentRequestsInfo.set(true);
      },
      error: (err: any) => {
        console.error('Error al cargar solicitudes enviadas:', err);
        this.sentRequestsInfo.set(true);
      }
    });
  }

  // Cancelar una solicitud de amistad enviada
  cancelSentRequest(requestUsername: string) {
    if (!requestUsername) return;
    console.log('Cancelando solicitud de amistad enviada a:', requestUsername);

    // DeleteFriend porq tmb sirve y hayy q avanzar
    this.friendService.deleteFriend(requestUsername).subscribe({
      next: () => {
        console.log('Solicitud de amistad cancelada correctamente');
        // Elimnar la solicitud de la lista local de enviadas
        this.sentRequests.set(this.sentRequests().filter(req => req.username !== requestUsername));
        
        // Si no quedan solicitudes enviadas, actualizar la vista
        if (this.sentRequests().length === 0 && this.requestTabState() === 'sent') {
          // Opcional: mantener el popup abierto si hay solicitudes recibidas 
        }
      },
      error: (err: any) => {
        console.error('Error al cancelar solicitud:', err);
      }
    });
  }

  //Añadir amigo
  addFriend() {
    const username = this.usernameInput.nativeElement.value.trim();
    if (!username) return; 

    const request: FriendshipRequest = {
          receiver_username: username,
    };

    this.friendService.addFriend(request).subscribe({
      next: () => {
        console.log('Solicitud de amistad enviada');
        this.popUP_newFriend.set(false);
        this.usernameInput.nativeElement.value = '';
      },
      error: (err:any) => {
        console.error(err);
      }
    });
  }

  // Eliminar amigo
  deleteFriend(friendUsername: string): void {
      this.friendService.deleteFriend(friendUsername).subscribe({
        next: () => {
            console.log('Amigo eliminado:', friendUsername);
            // Recargar la lista de amigos
            this.loadFriends();
        },
        error: (err: any) => {
            console.error('Error al eliminar amigo:', err);
        }
    });
}

  // Aceptar solicitud de amistad
  acceptRequest(requestUsername: string) {
    if (!requestUsername) return;

    this.friendService.acceptRequest(requestUsername).subscribe({
      next: () => {
        console.log('Solicitud de amistad aceptada');
        // Eliminar la solicitud de la lista local
        this.request.set(this.request().filter(req => req.username !== requestUsername));
        // Recargar la lista de amigos
        this.loadFriends();
        
        // Si no quedan solicitudes, cerrar el pop-up
        if (this.request().length === 0) {
          this.popUP_request.set(false);
        }
      },
      error: (err:any) => {
        console.error('Error al aceptar solicitud:', err);
      }
    });
  }

  // Rechazar solicitud de amistad
  rejectRequest(requestUsername: string) {
    if (!requestUsername) return;
     console.log('Solicitud de amistad rechazada:', requestUsername);

    // DeleteFriend porq tmb sirve y hayy q avanzar
    this.friendService.deleteFriend(requestUsername).subscribe({
      next: () => {
        console.log('Solicitud de amistad rechazada correctamente');
        // Eliminar la solicitud de la lista local
        this.request.set(this.request().filter(req => req.username !== requestUsername));
        
        // Si no quedan solicitudes, cerrar el pop-up
        if (this.request().length === 0) {
          this.popUP_request.set(false);
        }
      },
      error: (err: any) => {
        console.error('Error al rechazar solicitud:', err);
      }
    });
  }


  // Abre el popup al hacer clic en Retar
  openChallengeConfig(friend: FriendSummary): void {
    this.friendToChallenge = friend;
    this.selectedBoard.set(1);   
    this.selectedMode.set(this.timeModes[0]);
    this.selectedIncrement.set(0);
    this.customMinutes.set(5);
    this.customIncrementSec.set(0);
    this.showConfigPopup.set(true);
  }


  // Cierra el popup
  closeConfigPopup(): void {
    this.showConfigPopup.set(false);
    this.friendToChallenge = null;
  }

  // Para cambair el modo de tiempo y ajustar el incremento de tempo
  onModeChange(mode: any): void {
    this.selectedMode.set(mode);
    if (mode.id !== 'custom') {
      // Restablecer a primer incremento disponible
      this.selectedIncrement.set(mode.increments[0]);
    }
  }

  // Parámetros finales según el modo seleccionado
  getChallengeParams(): { startingTime: number, timeIncrement: number } {
    const mode = this.selectedMode();
    if (mode.id === 'custom') {
      let minutes = this.customMinutes();
      if (minutes > 180) minutes = 180;
      if (minutes < 1) minutes = 1;
      let inc = this.customIncrementSec();
      if (inc > 60) inc = 60;
      if (inc < 0) inc = 0;
      return { startingTime: minutes * 60, timeIncrement: inc };
    } else {
      return { startingTime: mode.baseSeconds, timeIncrement: this.selectedIncrement() };
    }
  }



  // Inciiar a una partida amistosa DESAFIAR
  sendChallenge(): void {
    if (!this.friendToChallenge) return;

    const board = this.selectedBoard();
    const { startingTime, timeIncrement } = this.getChallengeParams();

    const endpoint = 'challenge';
    const params = {
      username: this.friendToChallenge.username,
      board,
      starting_time: startingTime,
      time_increment: timeIncrement
    };

    this.websocket.initConnection(endpoint, params);

    if (this.wsSubscription) this.wsSubscription.unsubscribe();
    this.wsSubscription = this.websocket.gameMessages$.subscribe({
      next: (msg:  MessageGame) => {
        console.log('Mensaje recibido en Social:', msg);
        this.popUP_waiting.set(false);
        console.log("Entra a partida desde social");

        this.router.navigate(['/game']);
      },
      error: (err) => {
        console.error('Error en WS Social:', err);
        this.popUP_waiting.set(false);
        this.websocket.close();
      }
    });

    this.closeConfigPopup(); 
    this.popUP_waiting.set(true);
  }

  // Esto es para mostrar el pop-up
  challengeFriend(friendUsername: string): void {
    const friend = this.friends().find(f => f.username === friendUsername);
    if (friend) {
      this.openChallengeConfig(friend);   // Abre
    } else {
      console.error('Amigo no encontrado');
    }
  }

}
