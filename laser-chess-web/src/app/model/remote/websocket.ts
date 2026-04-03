import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ReplaySubject } from 'rxjs';
import { Remote } from './remote'; // <--- Importa tu servicio
import { API_URL } from '../../constants/app.const';

@Injectable({ providedIn: 'root' })
export class Websocket {
  private socket$?: WebSocketSubject<any>;
  
  // ReplaySubject(1) guarda el último mensaje para nuevas suscripciones
  public gameMessages$ = new ReplaySubject<any>(1);

  constructor(private remote: Remote) {}

  public connect(endpoint: string, params: any): void {
    if (this.socket$) return;

    const token = this.remote.getAccessToken(); 
    const searchParams = new URLSearchParams(params);
    if (token) searchParams.append('token', token);

    const url = `ws:${API_URL}/api/rt/${endpoint}?${searchParams.toString()}`;
    console.log('Conectando WS a:', url);

    this.socket$ = webSocket({
      url: url,
      deserializer: (msg) => JSON.parse(msg.data)
    });

    this.socket$.subscribe({
      next: (msg) => {
        console.log('Mensaje WS recibido:', msg); // debug
        this.gameMessages$.next(msg);
      },
      error: (err) => {
        console.error('Error WS:', err);
        this.socket$ = undefined;
      },
      complete: () => {
        this.socket$ = undefined;
      }
    });
  }
  public sendAction(action: any): void {
    this.socket$?.next(action);
  }

  public close(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined;
    }
  }
}


