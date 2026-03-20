import { Component, inject, ElementRef, ViewChild} from '@angular/core';
import { signal } from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';
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
  public friendsInfo = signal(false);
  

  ngOnInit(): void {
      this.friendService.getFriends().subscribe({
        next: (data) => {
          this.friends = data;
          console.log(this.friends);
          this.friendsInfo.set(true);
        },
        error: (err) => {
          console.error(err);
        }
      });
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

  addFriend() {
    const username = this.usernameInput.nativeElement.value.trim();
    if (!username) return; 

    const request: FriendshipRequest = {
          receiver_username: username,
    };
    console.log(this.username.valueOf());
    this.friendService.addFriend(request).subscribe({
      next: () => {
        console.log('Friendship request sended');
        this.popUP_newFriend.set(false)
      },
      error: (err) => {
        console.error(err);
      }
    });
}

  // Solicitudes de amistad
  pedingRequest(){
    this.friendService.getRequestFriends().subscribe({
      next: (data) => {
        console.log('Friendship requests available');
        this.request = data;
        console.log(this.request);
        this.popUP_request.set(true);
      },
      error: (err) => {
        console.error(err);
      }
    });
    
  }

  acceptRequest(){
    const username = ""; // como saco el nombre que selecciono??<;
    if (!username) return; 

    console.log(this.username.valueOf());
    this.friendService.acceptRequest(username).subscribe({
      next: () => {
        console.log('Friendship request sended');
        this.popUP_newFriend.set(false)
      },
      error: (err) => {
        console.error(err);   
      }
    });
  }

  copyLink(){}
}
