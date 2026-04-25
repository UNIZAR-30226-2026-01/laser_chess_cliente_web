import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface SseMessage {
  eventType: string;   // 'Init', 'Notification', 'GameUpdate', etc.
  data: any;
}

@Injectable({ providedIn: 'root' })
export class SseService implements OnDestroy {
  private eventSource?: EventSource;
  private messageSubject = new Subject<SseMessage>();

  constructor(private ngZone: NgZone) {}

  connect(token: string): void {
    if (this.eventSource) {
      this.disconnect();
    }

    const url = `/api/events?token=${encodeURIComponent(token)}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => console.log('SSE connected');
    this.eventSource.onerror = (err) => {
      console.error('SSE error', err);
      this.eventSource?.close();
      // Reconectar tras 5 segundos 
      setTimeout(() => this.connect(token), 5000);
    };

    // Eventos que conozco
    const knownEvents = ['Init', 'Notification', 'FriendRequest', 'Challenge', 'FriendAccepted', 'NewFriend'];
    knownEvents.forEach(type => {
      this.eventSource!.addEventListener(type, (event: any) => {
        this.ngZone.run(() => {
          let parsedData = event.data;
          try {
            parsedData = JSON.parse(event.data);
          } catch(e) {}
          this.messageSubject.next({ eventType: type, data: parsedData });
        });
      });
    });
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = undefined;
  }

  onMessage(): Observable<SseMessage> {
    return this.messageSubject.asObservable();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}