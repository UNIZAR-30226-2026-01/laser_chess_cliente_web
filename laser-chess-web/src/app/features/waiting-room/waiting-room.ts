import { Component, inject} from '@angular/core';
import { Websocket } from '../../model/remote/websocket'; // Ajusta la ruta


@Component({
  selector: 'app-waiting-room',
  imports: [],
  templateUrl: './waiting-room.html',
  styleUrl: './waiting-room.css',
})
export class WaitingRoom {

  private wsService = inject(Websocket);
  challenger = "user1";
  // Si el usuario CREA un reto:
  crearReto() {
    const datos = { username: 'user2', board: 1, starting_time: 600, time_increment: 0 };
    this.wsService.connect('challenge', datos);
    // El backend de Go deja la conexión "en espera" (bloqueada en <-client.Done)
    
  }

  // Si el usuario ACEPTA un reto de la lista:
  aceptarReto(usernameChallenger: string) {
    this.wsService.connect('challenge/accept', { username: usernameChallenger });
    // Al aceptar, Go arranca la Room y envía el primer mensaje de "partida empezada"
  }
}
