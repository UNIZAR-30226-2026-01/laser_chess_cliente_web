
import { Component, OnInit, OnDestroy, inject , signal} from '@angular/core';
import { Remote } from '../../model/remote/remote';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ChallengeResume } from '../../model/game/ChallengeResume';

@Component({
  selector: 'app-notification',
  imports: [],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})

export class Notification implements OnInit, OnDestroy {
  private notificationService = inject(Remote);
  private pollingSub?: Subscription;
  
  solicitudes: ChallengeResume[] = [];

  ngOnInit() {
    this.pollingSub = timer(0, 10000)
      .pipe(
        switchMap(() => this.notificationService.checkSolicitudes())
      )
      .subscribe({
        next: (data) => this.solicitudes = data,
        error: (err) => console.error('Error al obtener retos', err)
      });
  }

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
  }

  aceptar(id: number) {
    console.log('Aceptando partida de:', id);
    // Aquí iría tu lógica de navegación o llamada al backend
  }
}