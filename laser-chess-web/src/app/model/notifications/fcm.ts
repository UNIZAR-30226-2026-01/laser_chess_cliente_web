import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { environment } from '../../../environments/environment';


//Este code hay que mirarlo mas en detalle porq no comprendo fcm 

@Injectable({ providedIn: 'root' })
export class FcmService {
  private messaging;
  private messageSubject = new Subject<MessagePayload>();

  constructor(private http: HttpClient) {
    const app = initializeApp(environment.firebaseConfig);
    this.messaging = getMessaging(app);
  }

  async registerToken(userId: number): Promise<void> {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permiso de notificaciones denegado');
      return;
    }

    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.firebase.vapidKey,
      });
      if (token) {
        await this.http.post('/api/devices/register', { token }).toPromise();
        console.log('FCM token registrado');
      }
      // Escuchar mensajes mientras la app está en primer plano
      onMessage(this.messaging, (payload: MessagePayload) => {
        this.messageSubject.next(payload);
      });
    } catch (err) {
      console.error('Error registrando FCM', err);
    }
  }

  async unregisterToken(): Promise<void> {
    //Para cuando este lo de cerrar sesion ig
  }

  onForegroundMessage(): Observable<MessagePayload> {
    return this.messageSubject.asObservable();
  }
}