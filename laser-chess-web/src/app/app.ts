import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { IconService } from './model/user/icon';
import { Websocket } from './model/remote/websocket';

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
    private router: Router
  ) {
    this.ws.navigation$.subscribe(route => {
      console.log('Navegación global a:', route);
      this.router.navigate([route]);
    });
  }
}