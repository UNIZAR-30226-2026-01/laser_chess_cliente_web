// src/app/ranking/ranking.repository.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap, of } from 'rxjs';
import { Remote } from '../model/remote/remote';

// Modelos internos
export interface RankingPlayer {
  userId: number;
  username: string;
  elo: number;
}

export interface UserRankingInfo {
  position: number;
  elo: number;
}

export type EloType = 'blitz' | 'rapid' | 'classic' | 'extended';

// Mapeo según lo que espera el backend 
const eloTypeVect: Record<EloType, string> = {
  blitz: 'BLITZ',
  rapid: 'RAPID',
  classic: 'CLASSIC',
  extended: 'EXTENDED',
};


@Injectable({ providedIn: 'root' })
export class RankingRepository {
  private remote = inject(Remote);

  /**
   * Obtiene el top 100 de jugadores para un tipo de ELO.
   */
  getTop100(eloType: EloType): Observable<RankingPlayer[]> {
    const typeElo = eloTypeVect[eloType];
    return this.remote.getBest100(typeElo).pipe(
      map((response: any) => {
      let data = Array.isArray(response) ? response : (response.data ?? response.rankings ?? []);
      return data.map((item: any) => ({
        userId: item.user_id ?? item.userId,
        username: item.username,
        elo: item.value ?? item.elo_rating ?? item.elo ?? item.rating ?? item.blitz ?? item.rapid ?? item.classic ?? item.extended,
      }));
      })
    );
  }

  /**
   * Obtiene la posición y ELO del usuario actual para un tipo de ELO.
   */
  getCurrentUserPosition(eloType: EloType): Observable<UserRankingInfo | null> {
    const userId = this.remote.getAccountId();
    if (!userId) {
        return of(null);
    }

    const eloType2 = eloTypeVect[eloType];

    return this.remote.getMyPositicion(userId, eloTypeVect[eloType]).pipe(
        switchMap((positionResponse: any) => {
        console.log('RESPUESTA MI POSICION:', positionResponse);

        return this.remote.getAllRatings(userId).pipe(
            map((ratings: any) => ({
            position: typeof positionResponse === 'number' ? positionResponse : 0,
            elo: ratings[eloType] ?? 0
            }))
        );
    }));
    }
}