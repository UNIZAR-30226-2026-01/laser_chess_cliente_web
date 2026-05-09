import { Component, signal} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Websocket } from './model/remote/websocket';
import { NotificationService } from './model/notifications/notification';
import { Remote } from './model/remote/remote';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('laser-chess-web');

  

  

  constructor(
    private ws: Websocket,
    private router: Router,
    private remote : Remote,
    private notificationService: NotificationService,
  ) {
    this.ws.navigation$.subscribe(route => {
      console.log('Navegación global a:', route);
      this.router.navigate([route]);
    });
  }

  ngOnInit() {
    const token = this.remote.getAccessToken();

    if (token && !this.remote.isTokenExpired(token)) {
      this.ws.checkAndReconnect();
      this.notificationService.initIfLoggedIn();

      const currentPath = window.location.pathname;
      const isAddFriendRoute = currentPath.startsWith('/AñadirNuevoAmigo/');

      if (!isAddFriendRoute) {
        this.router.navigate(['/home']);
      }
    }
  }
}