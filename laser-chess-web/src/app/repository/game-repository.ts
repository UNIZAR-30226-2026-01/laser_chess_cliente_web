import { Inject, Injectable } from '@angular/core';
import { Observable , map, of} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PausedGame } from '../model/game/PausedGame';
import { Remote } from '../model/remote/remote';

@Injectable({
  providedIn: 'root',
})
export class GameRepository {
  pausedGames: PausedGame[] = [];
  remote = Inject(Remote);

  getPausedGame() {
    return this.remote.getPausedGames().pipe(
        map((data: PausedGame[]) => data || []),
        catchError((err: any) => {
          console.error('Error al cargar amigos:', err);
          return of([]);
        })
      );
  }
  
}
