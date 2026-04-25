import { inject, Injectable, signal} from '@angular/core';
import { Observable , map, of} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GameResume } from '../model/game/GameResume';
import { Remote } from '../model/remote/remote';
import { HistoryService } from '../model/remote/history-service';
@Injectable({
  providedIn: 'root',
})
export class GameRepository {
  pausedGames: GameResume[] = [];
  remote = inject(Remote);
  historyService = inject(HistoryService);

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

  
  
}
