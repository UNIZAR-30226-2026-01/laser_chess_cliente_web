// Cerebro del componente principal de la app
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/sidebar/sidebar';
import { IconService } from './model/user/icon';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],

  templateUrl: './app.html',
  // Enlaze con app.css > estilos globales de la app
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('laser-chess-web');
  constructor(private iconService: IconService) {}
}
