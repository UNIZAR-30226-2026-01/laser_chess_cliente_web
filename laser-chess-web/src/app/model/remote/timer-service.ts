import { Injectable, signal, Input, Output} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TimerService {

  // Los enviamos a game para que los muestre en pantalla
  @Output() miTiempo = signal<number>(300);       
  @Output() tiempoRival = signal<number>(300);

  @Input() esMiTurno = signal(true);

  private timerInterval: any = null;
  
   /*
     * Cositas de timers
     */
    startTimer() {
      this.stopTimer(); // evitar duplicados
  
      this.timerInterval = setInterval(() => {
        if (this.esMiTurno()) {
          this.miTiempo.update(t => Math.max(t - 1000, 0));
        } else {
          this.tiempoRival.update(t => Math.max(t - 1000, 0));
        }
      }, 1000);
    }
  
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }
  
    formatTime(ms: number): string {
      const totalSeconds = Math.floor(ms / 1000);
  
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
  
      const minStr = minutes.toString().padStart(2, '0');
      const secStr = seconds.toString().padStart(2, '0');
  
      return `${minStr}:${secStr}`;
    }
  
}
