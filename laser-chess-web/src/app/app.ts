import { Component, signal, inject} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { IconService } from './model/user/icon';
import { Websocket } from './model/remote/websocket';
import { NotificationService } from './model/notifications/notification';
import { Remote } from './model/remote/remote';
import { SseService } from './model/notifications/sse';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('laser-chess-web');

  

  constructor(
    private iconService: IconService,
    private ws: Websocket,
    private router: Router,
    private remote : Remote,
    private notificationService: NotificationService 
  ) {
    this.ws.navigation$.subscribe(route => {
      console.log('Navegación global a:', route);
      this.router.navigate([route]);
    });
  }

  ngOnInit() {
  const token = this.remote.getAccessToken();
  this.ws.checkAndReconnect();
  if (token && !this.remote.isTokenExpired(token)) {
    this.notificationService.initIfLoggedIn();
    
  }
}
}