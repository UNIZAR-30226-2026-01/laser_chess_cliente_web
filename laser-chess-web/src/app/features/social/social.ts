import { Component, inject, ElementRef, ViewChild} from '@angular/core';
import { signal } from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';
import { Router } from '@angular/router';
import { FriendSummary } from '../../model/social/FriendSummary'
import { Remote } from '../../model/remote/remote';
import { FriendshipRequest } from '../../model/social/FriendshipRequest';


@Component({
  selector: 'app-social',
  imports: [TopRow],
  templateUrl: './social.html',
  styleUrl: './social.css',
})


export class Social {
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

  friends: FriendSummary[] = []; // Lista de amigos del usuario
  request: FriendSummary[] = [];
  private friendService = inject(Remote);
  private router = inject(Router);
  public friendsInfo = signal(false);
  public requestInfo = signal(false);
  public popUP_userInfo = signal(false);
  public selectedUser: FriendSummary | null = null;
  

  ngOnInit(): void {
      this.loadFriends();
      this.loadRequests(); // Claro, sin esto no iba a ir de primeras ver las pendientes. Solo se veian despues de hacer click en el botn 
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
    this.popUP_request.set(true);
  }

  // abrir pop-up con información del usuario
  openUserInfo(user: FriendSummary) {
    this.selectedUser = user;
    this.popUP_userInfo.set(true);
  }

  // Cerrar pop-up de información
  closeUserInfo() {
    this.popUP_userInfo.set(false);
    this.selectedUser = null;
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
        this.friends = data;
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
        this.request = data;
        this.requestInfo.set(true);
      },
      error: (err:any) => {
        console.error('Error al cargar solicitudes:', err);
        this.requestInfo.set(true);
      }
    });
  }

  //Load sentRequest

  // Cancelar una solicitud de amistad enviada
  //deleteSentReques(friend):void{}

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
        // Remover la solicitud de la lista local
        this.request = this.request.filter(req => req.username !== requestUsername);
        // Recargar la lista de amigos
        this.loadFriends();
        
        // Si no quedan solicitudes, cerrar el pop-up
        if (this.request.length === 0) {
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
     console.log('Solicitud de amistad rechazada (a priori):', requestUsername);

    /* 
    this.friendService.rejectRequest(requestUsername).subscribe({
      next: () => {
        console.log('Solicitud de amistad rechazada');
        this.request = this.request.filter((req: FriendSummary) => req.username !== requestUsername);
        
        // Si no quedan solicitudes, cerrar el pop-up
        if (this.request.length === 0) {
          this.popUP_request.set(false);
        }
      },
      error: (err) => {
        console.error('Error al rechazar solicitud:', err);
      }
    });
    */
  }


  // Inciiar a una partida amistosa
  challengeFriend(friendUsername: string): void {
    this.friendService.challengeFriend(friendUsername).subscribe({
      next: (response) => {
        console.log('Reto enviado a:', friendUsername);
        this.router.navigate(['/game']); //Demomento se le manda a la pantalla de juego
      },
      error: (err: any) => {
        console.error('Error al enviar reto:', err);
      }
    });
  }

  // Cancelar challengeRequest
  //


}
