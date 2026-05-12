import { Component, signal} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Websocket } from './model/remote/websocket';
import { NotificationService } from './model/notifications/notification';
import { Remote } from './model/remote/remote';
import { NavigationEnd } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { API_URL } from './constants/app.const';

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
  console.log('APP ngOnInit - pathname:', window.location.pathname);
  console.log('APP ngOnInit - token válido:', token && !this.remote.isTokenExpired(token));

  if (token && !this.remote.isTokenExpired(token)) {
    this.ws.checkAndReconnect();
    this.notificationService.initIfLoggedIn();
    this.remote.markOnline().subscribe(); 

    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon(`${API_URL}/api/events/offline`);
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      take(1)
    ).subscribe((e: NavigationEnd) => {
      console.log('APP NavigationEnd - url:', e.url);
      console.log('APP NavigationEnd - urlAfterRedirects:', e.urlAfterRedirects);
      console.log('APP - ¿navega a home?', !e.urlAfterRedirects.includes('/add-friend/'));
      
      if (!e.urlAfterRedirects.includes('/add-friend/')) {
        this.router.navigate(['/home']);
      }
    });
  }
}
}