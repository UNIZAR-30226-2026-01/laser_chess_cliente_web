import { Injectable, inject, signal} from '@angular/core';
import { Remote } from '../model/remote/remote';
import { AllRatingsDTO } from '../model/rating/AllRatingsDTO';
import { UpdateAccountRequest } from '../model/auth/UpdateAccountRequest';
import { MyProfile } from '../model/user/MyProfile';
import { XpInfo } from '../model/user/ProfileCardData';
import { Observable, switchMap, map, shareReplay, BehaviorSubject, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
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

  private notificationsSubject = new BehaviorSubject<boolean>(this.getStoredNotificationEnabled());

  constructor() {
    // Sincronizar cambios con localStorage
    this.notificationsSubject.subscribe(enabled => {
      localStorage.setItem('notifications_enabled', JSON.stringify(enabled));
    });
  }

  private getStoredNotificationEnabled(): boolean {
    const stored = localStorage.getItem('notifications_enabled');
    return stored ? JSON.parse(stored) : true; // por defecto true
  }

  getNotificationEnabled(): boolean {
    return this.notificationsSubject.value;
  }

  setNotificationEnabled(enabled: boolean): void {
    this.notificationsSubject.next(enabled);
  }

  // Obtener email actual
  getCurrentEmail(): Observable<string> {
    return this.remoteService.getOwnAccount().pipe(
      map(acc => acc.mail ?? '')
    );
  }

  // Cambiar email
  changeEmail(newEmail: string): Observable<void> {
    return this.getOwnAccount().pipe(
      switchMap(currentProfile => {
        const updateRequest: UpdateAccountRequest = {
          username: currentProfile.username,
          mail: newEmail,
          board_skin: currentProfile.board_skin,
          piece_skin: currentProfile.piece_skin,
          win_animation: currentProfile.win_animation
        };
        return this.remoteService.updateAccount(updateRequest).pipe(
          map(() => {})
        );
      }),
      catchError(err => {
        console.error('Error changing email', err);
        return throwError(() => new Error('No se pudo cambiar el email'));
      })
    );
  }

  // Cambiar contraseña
  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.remoteService.changePassword(oldPassword, newPassword).pipe(
      catchError(err => {
        console.error('Error changing password', err);
        return throwError(() => new Error('Contraseña actual incorrecta o error en el servidor'));
      })
    );
  }

  

  // Eliminar cuenta
  deleteAccount(): Observable<void> {
    return this.remoteService.deleteAccount().pipe(
      catchError(err => {
        console.error('Error deleting account', err);
        return throwError(() => new Error('No se pudo eliminar la cuenta'));
      })
    );
  }




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

  getLevel(): number | undefined {
    return this.userProfile?.level;
  }


  getUsernameById(id: number): Observable<string> {
    return this.remoteService.getAccount(id).pipe(
      map(response => response.body?.username ?? '')
    );
  }

  getBlitzElo(): number | undefined {
    return this.userProfile?.blitzElo;
  }

  getRapidElo(): number | undefined {
    return this.userProfile?.rapidElo;
  }

  getClassicElo(): number | undefined {
    return this.userProfile?.classicElo;
  }

  getExtendedElo(): number | undefined {
    return this.userProfile?.extendedElo;
  }

  getPieceSkin(): number | undefined {
    return this.userProfile?.piece_skin;
  }

  getAvatar(): number | undefined {
    return this.userProfile?.avatar;
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

  getXpInfo(): Observable<XpInfo> {
    return this.remoteService.getXpInfo();
  }
}
