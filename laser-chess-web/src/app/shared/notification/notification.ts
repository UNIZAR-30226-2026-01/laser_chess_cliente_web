import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Remote } from '../../model/remote/remote';
import { Subscription, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ChallengeResume } from '../../model/game/ChallengeResume';

@Component({
  selector: 'app-notification',
  standalone: true, // Asegúrate de que sea standalone si usas imports
  imports: [],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification implements OnInit, OnDestroy {
  private notificationService = inject(Remote);
  private pollingSub?: Subscription;
  
  // 1. Usamos un Signal para que la vista sea ultra-reactiva
  solicitudes = signal<ChallengeResume[]>([]);

  ngOnInit() {
    // Polling cada 10 segundos
    this.pollingSub = timer(0, 10000)
      .pipe(
        switchMap(() => this.notificationService.checkSolicitudes()),
        // Tap es útil para debugear y ver qué llega exactamente
        tap(data => console.log('Nuevos retos recibidos:', data))
      )
      .subscribe({
        next: (data) => {
          // 2. Actualizamos el signal con los nuevos datos
          this.solicitudes.set(data);
        },
        error: (err) => console.error('Error al obtener retos', err)
      });
  }

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
  }

  aceptar(id: number) {
    console.log('Aceptando partida de:', id);
    // Tip: podrías filtrar el array localmente para dar feedback instantáneo
    // this.solicitudes.update(list => list.filter(r => r.ChallengerID !== id));
  }
}