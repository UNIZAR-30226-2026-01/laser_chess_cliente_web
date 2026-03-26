import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { MessageGame } from '../game/MessageGame';

@Injectable({
  providedIn: 'root',
})
export class Websocket {
  private socket$!: WebSocketSubject<any>;
  // Este Subject es el "túnel" que nunca falla aunque el socket se reinicie
  private gameMessages$ = new Subject<MessageGame>();

  public connect(url: string): void {
    this.socket$ = webSocket(url); // Configuración por defecto (maneja JSON solo)

    // Nos suscribimos internamente al socket para pasarle los datos al Subject
    this.socket$.subscribe({
      next: (msg) => {
        console.log("Servicio recibió:", msg);
        this.gameMessages$.next(msg);
      },
      error: (err) => console.error("Error WS:", err),
      complete: () => console.warn("Conexión cerrada")
    });

    console.log("Conectado a: " + url);
  }

  public get gameUpdates$(): Observable<MessageGame> {
    // El componente se suscribe a este Subject, no al socket directo
    return this.gameMessages$.asObservable();
  }

  public sendAction(action: any): void {
    if (this.socket$) {
      this.socket$.next(action); 
    }
  }

  public close(): void {
    if (this.socket$) this.socket$.complete();
  }
}