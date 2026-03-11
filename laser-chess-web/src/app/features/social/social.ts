import { Component } from '@angular/core';
import { signal } from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';

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
  public popUP_nuevoAmigo = signal(false);
  public state = signal(true); // State == true -> Social, State == false -> In Progress


  onArrowClick() {
    // Llamada al backend para obetener solicitudes de amistad?
    console.log('Arrow clicked');
    // Redirigir a pantalla de solicitudes de amistad
  }

  nuevoAmigo(){
    console.log('Abrir pop-up para introducir datos de nuevo amigo');
    this.popUP_nuevoAmigo.set(true);
  }

  copyLink(){}
}
