import { Injectable, } from '@angular/core';
import { Router } from '@angular/router';
import { SseService, SseMessage } from './sse';
import { Remote } from '../remote/remote'; 
import { Subject, Subscription } from 'rxjs';
import { UserRespository } from '../../repository/user-respository';


@Injectable({ providedIn: 'root' })
export class NotificationService {
  private isSetup = false;
  private sseSub?: Subscription;
  private wakeSocialSubject = new Subject<void>();
  private wakeHomeSubject = new Subject<void>();

  wakeSocial$ = this.wakeSocialSubject.asObservable();
  wakeHome$ = this.wakeHomeSubject.asObservable();

  constructor(
    private sse: SseService,
    private remote: Remote,
    private router: Router,
    private userRepo: UserRespository
  ) {}


  initIfLoggedIn(): void {
    const token = this.remote.getAccessToken();

    if (!token || this.remote.isTokenExpired(token)) {
      return;
    }

    const userId = this.remote.getAccountId();
    if (!userId) return;

    this.setupAfterLogin();
  }

  /**
   * Despues de iniciar sesion
   */
  async setupAfterLogin() {
    if (this.isSetup) return;
    const token = this.remote.getAccessToken();
    if (!token) return;

    this.teardownOnLogout();

    this.sse.connect(token);

    this.sseSub = this.sse.onMessage().subscribe(event => {
      console.log('Evento SSE recibido:', event);
      this.handleEvent(event);
    });

    this.isSetup = true;
  }

  /**
   * Al hacer logout se llama a esto
   */
  teardownOnLogout() {
    this.sse.disconnect();
    this.sseSub?.unsubscribe?.();
    this.isSetup = false;
    this.sseSub = undefined;
  }

  private handleEvent(event: SseMessage): void {
  switch (event.eventType) {
    case 'FriendRequest':
      const username = typeof event.data === 'string' ? event.data : event.data?.username || 'alguien';
      this.showWebNotification('Nueva solicitud de amistad', `Has recibido una solicitud de ${username}`,{ type: 'friend_request', username });
      this.wakeSocialSubject.next();
      break;
    case 'Challenge':
      const challenger = typeof event.data === 'string' ? event.data : event.data?.challenger || 'alguien';
      this.showWebNotification('Invitación de partida', `${challenger} te ha retado a una partida`, { type: 'challenge', challenger });
      this.wakeHomeSubject.next();
      break;
    case 'NewFriend': 
      const friendName = typeof event.data === 'string' ? event.data : event.data?.username || 'alguien';
      this.showWebNotification('¡Nuevo amigo!', `Ahora eres amigo de ${friendName}`, { type: 'friend_accepted', username: friendName });
      this.wakeSocialSubject.next();
      break;
    default:
      if (event.eventType === 'Notification') {
        const message =
          typeof event.data === 'string'
            ? event.data
            : event.data?.message || 'Tienes una nueva notificación';

        this.showWebNotification('Aviso', message, null);
      }
  }
}

  showWebNotification(title: string, body: string, data: any = null): void {
    if (!this.userRepo.getNotificationEnabled()) {
      return;
    }
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones web');
      return;
    }
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/assets/icon.png'
      });

      notification.onclick = () => {
        window.focus();

        if (data?.type === 'friend_request') {
          this.router.navigate(['/social']);
        }

        if (data?.type === 'challenge') {
          this.router.navigate(['/home']);
        }

        if (data?.type === 'friend_accepted') {
          this.router.navigate(['/social']);
        }

        notification.close();
      };

      return;
    }

    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showWebNotification(title, body, data);
        }
      });
    }
  }
}