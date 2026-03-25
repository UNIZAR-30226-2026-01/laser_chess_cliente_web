import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class Websocket {
  // WebSocketSubject gestiona internamente la conexión, reconexión y serialización
  private socket$!: WebSocketSubject<any>;

  /**
   * Conecta al servidor. 
   */
  // Hay que hacer una llamada la backend a un endpoint para obtener el WebSocket
  public connect(url: string): void {
    this.socket$ = webSocket({
      url: url,
      deserializer: (msg) => msg.data,
      serializer: (msg) => msg
    });

    console.log("Conectado a: " + url);
  }

  // Exposición como Observable para recibir mensajes del backend
  public get gameUpdates$(): Observable<string> {
    // Devolvemos los que hemos recibido del backend
    return this.socket$.asObservable();
  }

  // Envío de la acción realizada al backend parseada a string
  public sendAction(action: string): void {
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