import { Inject, Injectable, signal} from '@angular/core';
import { Observable , map, of} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GameResume } from '../model/game/GameResume';
import { Remote } from '../model/remote/remote';

@Injectable({
  providedIn: 'root',
})
export class GameRepository {
  pausedGames: GameResume[] = [];
  historySelectedGame = signal<GameResume> (null as unknown as GameResume);
  remote = Inject(Remote);

  getPausedGame() : Observable<GameResume[]> {
    return this.remote.getPausedGames().pipe(
        map((data: GameResume[]) => data || []),
        catchError((err: any) => {
          console.error('Error al cargar amigos:', err);
          return of([]);
        })
      );
  }

  getFinishedGame() : Observable<GameResume[]>{
    return this.remote.getFinishedGames().pipe(
        map((data: GameResume[]) => data || []),
        catchError((err: any) => {
          console.error('Error al cargar amigos:', err);
          return of([]);
        })
      );
  }

  reproducirHistorial() {
    const partida = this.historySelectedGame();
  }
  
}
