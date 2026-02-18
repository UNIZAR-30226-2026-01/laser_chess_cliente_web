// Cerebro del componente principal de la app
import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],

  templateUrl: './app.html',
  // Enlaze con app.css > estilos globales de la app
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('laser-chess-web');
}
