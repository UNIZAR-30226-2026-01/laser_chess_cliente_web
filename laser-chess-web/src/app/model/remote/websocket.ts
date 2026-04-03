import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ReplaySubject } from 'rxjs';
import { Remote } from './remote'; // <--- Importa tu servicio
import { API_URL } from '../../constants/app.const';

@Injectable({ providedIn: 'root' })
export class Websocket {
  private socket$?: WebSocketSubject<any>;
  public gameMessages$ = new ReplaySubject<any>(1); // ya lo tenías

  constructor(private remote: Remote) {}

  // Método para iniciar la conexión si no existe
  public initConnection(endpoint: string, params: any): void {
    if (this.socket$) return; // Ya está conectado, no hacer nada

    const token = this.remote.getAccessToken();
    const searchParams = new URLSearchParams(params);
    if (token) searchParams.append('token', token);

    const url = `ws:${API_URL}/api/rt/${endpoint}?${searchParams.toString()}`;
    console.log('Conectando WS a:', url);

    this.socket$ = webSocket({
      url: url,
      deserializer: msg => JSON.parse(msg.data),
      openObserver: { next: () => console.log('S conectado') },
      closeObserver: { next: () => console.log('WS cerrado') }
    });

    // Suscripción única
    this.socket$.subscribe({
      next: msg => this.gameMessages$.next(msg),
      error: err => {
        console.error('Error WS:', err);
        this.socket$ = undefined;
      },
      complete: () => {
        console.log('WS COMPLETADO');
        this.socket$ = undefined;
      }
    });
  }

  public sendAction(action: any): void {
    console.log('Enviando acción:', action);
    this.socket$?.next(JSON.stringify(action));
  }

  public close(): void {
    this.socket$?.complete();
    this.socket$ = undefined;
  }
}


