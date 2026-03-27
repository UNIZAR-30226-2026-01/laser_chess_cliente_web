import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Remote } from './remote'; // <--- Importa tu servicio
import { API_URL, ACCESS_TOKEN } from '../../constants/app.const';


@Injectable({ providedIn: 'root' })
export class Websocket {
  private socket$?: WebSocketSubject<any>;
  private gameMessages$ = new Subject<any>();

  constructor(private remote: Remote) {} // <--- Inyectamos Remote

  public connect(endpoint: string, params: any): void {
    if (this.socket$) return;

    // 1. Obtener el token directamente desde Remote
    const token = this.remote.getAccessToken(); 

    // 2. Construir la URL con el token como query param para el backend en Go
    const searchParams = new URLSearchParams(params);
    if (token) {
      searchParams.append('token', token); 
    }
    
    const url = `ws:${API_URL}/api/rt/${endpoint}?${searchParams.toString()}`;

    this.socket$ = webSocket({
      url: url,
      // Opcional: si el backend no manda JSON puro, puedes añadir un deserializer
      deserializer: (msg) => JSON.parse(msg.data)
    });

    this.socket$.subscribe({
      next: (msg) => this.gameMessages$.next(msg),
      error: (err) => {
        console.error("Error WS:", err);
        this.socket$ = undefined;
      },
      complete: () => {
        this.socket$ = undefined;
      }
    });
  }

  public get gameUpdates$(): Observable<any> {
    return this.gameMessages$.asObservable();
  }

  public sendAction(action: any): void {
    this.socket$?.next(action);
  }
}