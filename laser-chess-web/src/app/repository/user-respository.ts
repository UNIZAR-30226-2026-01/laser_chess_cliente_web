import { Injectable, inject, signal} from '@angular/core';
import { Remote } from '../model/remote/remote';
import { AllRatingsDTO } from '../model/rating/AllRatingsDTO';
import { UpdateAccountRequest } from '../model/auth/UpdateAccountRequest';
import { MyProfile } from '../model/user/MyProfile';
import { XpInfo } from '../model/user/ProfileCardData';
import { Observable, switchMap, map, of, shareReplay} from 'rxjs';

export type { XpInfo } from '../model/user/ProfileCardData';


/*
 * UserRepository : El UserRepository agrupa toda la lógica asociada al dominio de los usuarios de la aplicación.
 * Dependencia: Remote
 * Responsabilidades:
 * - Obtener la información del perfil del usuario.
 * - Actualizar la información del perfil del usuario.
 * - Eliminar la cuenta del usuario.
*/


@Injectable({
  providedIn: 'root',
})
export class UserRespository {
  private remoteService = inject(Remote);
  userProfile: MyProfile | null = null;

  // Obtener datos del perfil de un usuario
  getAccount( id: number): Observable<MyProfile> {
    

    return this.remoteService.getAccount(id).pipe(
      switchMap(response => {
        const acc = response.body as any;

        const profile: MyProfile = {
          userId: id,
          username: acc.username || 'Usuario',
          mail: acc.mail || '',
          xp: acc.xp ?? 0,
          level: acc.level ?? 0,
          avatar: acc.avatar ?? 0,
          money: acc.money ?? 0,
          board_skin: acc.board_skin ?? 0,
          piece_skin: acc.piece_skin ?? 0,
          win_animation: acc.win_animation ?? 0,
          rankedPoints: acc.rankedPoints ?? 0,
          blitzElo: undefined,
          rapidElo: undefined,
          classicElo: undefined,
          extendedElo: undefined,
        };


        return this.remoteService.getAllRatings(id).pipe(
          map((ratings: AllRatingsDTO) => ({
            ...profile,
            blitzElo: ratings.blitz,
            rapidElo: ratings.rapid,
            classicElo: ratings.classic,
            extendedElo: ratings.extended
          }))
        );
      }),
      shareReplay(1)
    );

  }

  getOwnAccount(): Observable<MyProfile> {
    return this.remoteService.getOwnAccount().pipe(
      // Cambiamos 'map' por 'switchMap' porque vamos a devolver otro Observable
      switchMap(acc => {
        const profile: MyProfile = {
          userId: acc.account_id ?? 0,
          username: acc.username || 'Usuario',
          mail: acc.mail || '',
          xp: acc.xp ?? 0,
          level: acc.level ?? 0,
          avatar: acc.avatar ?? 0,
          money: acc.money ?? 0,
          board_skin: acc.board_skin ?? 0,
          piece_skin: acc.piece_skin ?? 0,
          win_animation: acc.win_animation ?? 0,
          rankedPoints: acc.rankedPoints ?? 0,
          blitzElo: undefined,
          rapidElo: undefined,
          classicElo: undefined,
          extendedElo: undefined,
        };

        this.userProfile = profile;

        // Usamos profile.userId en lugar de acc.userId (que no existe en AccountResponse)
        return this.remoteService.getAllRatings(profile.userId).pipe(
          map((ratings: AllRatingsDTO) => ({
            ...profile,
            blitzElo: ratings.blitz,
            rapidElo: ratings.rapid,
            classicElo: ratings.classic,
            extendedElo: ratings.extended
          }))
        );
      }),
      shareReplay(1)
    );
  }

  getUsername() : string | undefined {
    return this.userProfile?.username;
  }

  getId() : number | undefined {
    return this.userProfile?.userId;
  }

  // Actualizar datos del perfil del usuario
  updateData(username: string , mail: String, board_skin: number, piece_skin: number, win_animation: number){
    console.log("Update data");
    const request: UpdateAccountRequest = {
      // Revisar si tengo que mandar el contenido que ya tiene
      username: username || this.userProfile?.username || '',
      mail: mail || this.userProfile?.mail || '',
      board_skin: board_skin || this.userProfile?.board_skin || 0,
      piece_skin: piece_skin || this.userProfile?.piece_skin || 0,
      win_animation: win_animation || this.userProfile?.win_animation || 0
    };

    // Llamada al servicio
    this.remoteService.updateAccount(request).subscribe({
      next: (httpResponse) => {
        if (httpResponse && httpResponse.body) {
          console.log('Perfil actualizado con éxito');

        } else {
          console.log('Update failed: No response body');
        }
      },
        error: (err) => {
          console.error('HTTP error during update', err);
          console.log('Update failed: No response body');
      }
    });


  }

  // Borrar la cuenta del usuarios
  deleteAccount(){
    console.log("Delete account");
    this.remoteService.deleteAccount().subscribe({
      next: (httpResponse) => {
        if (httpResponse) {
          console.log('Cuenta eliminada con éxito');
          this.remoteService.logout();
        } else {
          console.warn('Delete failed: Unexpected response status');
        }
      },
      error: (err) => {
        console.error('HTTP error during delete', err);
        console.log('Delete failed: No response body');
      }
    });
  }

  getXpInfo(): Observable<XpInfo> {
    return this.remoteService.getXpInfo();
  }
}
