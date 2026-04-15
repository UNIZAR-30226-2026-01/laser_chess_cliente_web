import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ReplaySubject, Subject} from 'rxjs';
import { Remote } from './remote'; // <--- Importa tu servicio
import { API_URL } from '../../constants/app.const';


/*
 * Websocket : El Websocket agrupa toda la lógica asociada a la conexión WebSocket.
 * Dependencia: Remote
 * Responsabilidades:
 * - Iniciar la conexión WebSocket.
 * - Enviar acciones a través del WebSocket.
 * - Cerrar la conexión WebSocket.
*/

@Injectable({ providedIn: 'root' })
export class Websocket {

  private socket$?: WebSocketSubject<any>;

  private mode: 'lobby' | 'game' = 'lobby';

  public gameMessages$ = new ReplaySubject<any>(1);
  public lobbyEvents$ = new Subject<any>();
  public navigation$ = new Subject<string>();

  constructor(private remote: Remote) {}

  public initConnection(endpoint: string, params: any): void {

    if (this.socket$) {
      this.close();
    }

    this.mode = 'lobby';
    this.gameMessages$ = new ReplaySubject<any>(1);

    const token = this.remote.getAccessToken();
    const searchParams = new URLSearchParams(params);
    if (token) searchParams.append('token', token);

    const url = `ws:${API_URL}/api/rt/${endpoint}?${searchParams.toString()}`;
    console.log('Conectando WS a:', url);

    this.socket$ = webSocket({
      url: url,
      deserializer: msg => JSON.parse(msg.data),
      openObserver: { next: () => console.log('WS conectado') },
      closeObserver: { next: () => console.log('WS cerrado') }
    });

    this.socket$.subscribe({
      next: msg => this.handleMessage(msg),   
      error: err => {
        if (err?.code === 1006) return; // cierre normal en muchos backends
        console.error('Error WS:', err);
        this.socket$ = undefined;
      },
      complete: () => {
        console.log('WS COMPLETADO');
        this.socket$ = undefined;
      }
    });
  }

  private handleMessage(msg: any) {

    if (this.mode === 'lobby') {

      if (msg.Type === 'InitialState') {
        console.log('Pasando a GAME');

        this.mode = 'game';
        this.gameMessages$.next(msg);
        this.navigation$.next('/game');

        return;
      }

      this.lobbyEvents$.next(msg);
      return;
    }

    if (this.mode === 'game') {
      this.gameMessages$.next(msg);
    }
  }

  public sendAction(action: any): void {
    console.log('Enviando acción:', action);
    this.socket$?.next(action);
  }

  public close(): void {
    this.socket$?.complete();
    this.socket$ = undefined;
  }
}