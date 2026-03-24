import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { GameAction } from '../game/GameAction';

@Injectable({
  providedIn: 'root',
})
export class Websocket {
  // WebSocketSubject gestiona internamente la conexión, reconexión y serialización
  private socket$!: WebSocketSubject<any>;

  /**
   * Conecta al servidor. 
   * RxJS se encarga de hacer el JSON.parse y JSON.stringify automáticamente.
   */
  public connect(url: string): void {
    this.socket$ = webSocket({
      url: url,
    });

    console.log("Conectado a: " + url);
  }

  // Exposición como Observable para recibir mensajes del backend
  public get gameUpdates$(): Observable<GameAction> {
    // Devolvemos los que hemos recibido del backend
    return this.socket$.asObservable();
  }

  // Envío de la acción realizada al backend parseada a string
  public sendAction(action: GameAction): void {
    if (this.socket$) {
      this.socket$.next(action); 
    } else {
      console.error("No hay conexión activa.");
    }
  }

  // Cierre del WebSocket
  public close(): void {
    this.socket$.complete();
  }
}