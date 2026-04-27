// notification.service.ts
import { Injectable, } from '@angular/core';
import { Router } from '@angular/router';
import { SseService, SseMessage } from './sse';
import { FcmService } from './fcm';
import { Remote } from '../remote/remote'; 
import { Subject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class NotificationService {
  private isSetup = false;


  private wakeSocialSubject = new Subject<void>();
  private wakeHomeSubject = new Subject<void>();

  wakeSocial$ = this.wakeSocialSubject.asObservable();
  wakeHome$ = this.wakeHomeSubject.asObservable();

  constructor(
    private sse: SseService,
    private fcm: FcmService,
    private remote: Remote,
    private router: Router
  ) {
    // Escuchar eventos sse y fcm 
    this.sse.onMessage().subscribe(event => {
      console.log('TODOS LOS EVENTOS SSE:', event);
      this.handleEvent(event);
    });
    this.fcm.onForegroundMessage().subscribe(payload => {
      if (payload.notification) {
        this.showWebNotification(
          payload.notification.title || 'Notificación',
          payload.notification.body || '',
          payload.data
        );
      }
    });
  }

  private sseSub?: any;

  private initSse() {
    this.sseSub?.unsubscribe?.();

    this.sseSub = this.sse.onMessage().subscribe(event => {
      this.handleEvent(event);
    });
  }

  /**
   * Despues de iniciar sesion
   */
  async setupAfterLogin(userId: number) {
    const token = this.remote.getAccessToken();
    if (!token) return;

    this.teardownOnLogout();

    this.sse.connect(token);
    this.initSse(); // si lo has añadido

    this.isSetup = true;
  }

  /**
   * Al hacer logout se llama a esto
   */
  teardownOnLogout() {
    this.sse.disconnect();
    this.sseSub?.unsubscribe?.();
    this.isSetup = false;
  }

  private handleEvent(event: SseMessage): void {
  console.log('Evento SSE recibido:', event);
  switch (event.eventType) {
    case 'FriendRequest':
      const username = typeof event.data === 'string' ? event.data : event.data?.username || 'alguien';
      this.showWebNotification('Nueva solicitud de amistad', `Has recibido una solicitud de ${username}`,{ type: 'friend_request', username });
      break;
    case 'Challenge':
      const challenger = typeof event.data === 'string' ? event.data : event.data?.challenger || 'alguien';
      this.showWebNotification('Invitación de partida', `${challenger} te ha retado a una partida`, { type: 'challenge', challenger });
      break;
    case 'NewFriend': 
      const friendName = typeof event.data === 'string' ? event.data : event.data?.username || 'alguien';
      this.showWebNotification('¡Nuevo amigo!', `Ahora eres amigo de ${friendName}`, { type: 'friend_accepted', username: friendName });
      break;
    default:
      if (event.eventType === 'Notification') {
        this.showWebNotification('Aviso', event.data.message, null);
      }
  }
}

  private showWebNotification(title: string, body: string, data: any = null): void {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones web');
      return;
    }
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, { body, icon: '/assets/icon.png' });
      notification.onclick = () => {
        window.focus();
        if (data) {
          if (data.type === 'friend_request') {
            this.wakeSocialSubject.next();
            this.showWebNotification('Nueva solicitud de amistad', 'Tienes una nueva solicitud');
            this.router.navigate(['/social']);
          } else if (data.type === 'challenge') {
            this.wakeHomeSubject.next();
            this.showWebNotification('Invitación de partida', 'Te han retado a una partida');
            this.router.navigate(['/home']);
          }else if (data.type === 'friend_accepted') {
            this.wakeSocialSubject.next();
            this.router.navigate(['/social']);
          }
        }
        notification.close();
      };
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') this.showWebNotification(title, body, data);
      });
    }
  }
}