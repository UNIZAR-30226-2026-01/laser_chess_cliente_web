// notification.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SseService, SseMessage } from './sse';
import { FcmService } from './fcm';
import { Remote } from '../remote/remote'; 

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private isSetup = false;

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

  /**
   * Despues de iniciar sesion
   */
  async setupAfterLogin(userId: number) {
    if (this.isSetup) return;
    const token = this.remote.getAccessToken();
    if (!token) return;
    this.sse.connect(token);
    //await this.fcm.registerToken(userId);  //esto decomentarlo cuando fcm funcione bn
    this.isSetup = true;
  }

  /**
   * Al hacer logout se llama a esto
   */
  teardownOnLogout() {
    this.sse.disconnect();
    this.isSetup = false;
  }

  private handleEvent(event: SseMessage): void {
  console.log('Evento SSE recibido:', event);
  switch (event.eventType) {
    case 'FriendRequest':
      const username = typeof event.data === 'string' ? event.data : event.data?.username || 'alguien';
      this.showWebNotification('Nueva solicitud de amistad', `Has recibido una solicitud de ${username}`);
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
            this.router.navigate(['/social/friend-requests']);
          } else if (data.type === 'challenge') {
            this.router.navigate(['/game/challenges']);
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