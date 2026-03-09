import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-pieza',
  standalone: true,
  imports: [], // ← aquí incluimos la directiva
  templateUrl: './pieza.html',
  styleUrls: ['./pieza.css'],
})
export class Pieza {
  boardSize = 5;

  // Posición de la pieza
  position = signal({ x: 3, y: 3 });

  // Indica si los spots deben mostrarse
  showSpots = signal(false);

  toggleSpots() {
    this.showSpots.set(!this.showSpots());
  }

  move(dx: number, dy: number) {
    const { x, y } = this.position();
    const newX = x + dx;
    const newY = y + dy;

    if (newX >= 1 && newX <= this.boardSize &&
        newY >= 1 && newY <= this.boardSize) {
      this.position.set({ x: newX, y: newY });
    }

    // Oculta los spots después de mover
    this.showSpots.set(false);
  }
}