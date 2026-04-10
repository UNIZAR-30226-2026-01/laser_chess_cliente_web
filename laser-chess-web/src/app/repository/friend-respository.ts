import { Injectable, inject} from '@angular/core';
import { Remote } from '../model/remote/remote';
import { Observable, of } from 'rxjs';
import { tap, catchError, map} from 'rxjs/operators';
import { FriendshipRequest } from '../model/social/FriendshipRequest';
import { FriendSummary } from '../model/social/FriendSummary'
import { AllRatingsDTO } from '../model/rating/AllRatingsDTO';



@Injectable({
  providedIn: 'root',
})
export class FriendRespository {
  private remoteService = inject(Remote);

  getFriends(): Observable<FriendSummary[]> {
    return this.remoteService.getFriends().pipe(
      map((data: FriendSummary[]) => data || []),
      catchError((err: any) => {
        console.error('Error al cargar amigos:', err);
        return of([]);
      })
    );
  }

  getAllRatings(userIdNumber: number) : Observable<AllRatingsDTO> {
    return this.remoteService.getAllRatings(userIdNumber).pipe();

  }

  addFriend(request: FriendshipRequest ) : Observable<boolean | void> {
    return this.remoteService.addFriend(request).pipe(
      tap(() => {
        console.log('Solicitud de amistad enviada');
        return of(true);
      }),
      catchError((err: any) => {
        console.error(err);
        return of(false);
      })
    );
  }


  deleteFriend(friendUsername: string) : Observable<boolean | void> {
    return this.remoteService.deleteFriend(friendUsername).pipe(
      tap(() => {
        console.log('Amigo eliminado:', friendUsername);
        // Recargar la lista de amigos
        return of(true);
      }),
      catchError((err: any) => {
        console.error('Error al eliminar amigo:', err);
        return of(false);
      })
    );
  }
        

  //Cargar solicitudes de amistad recibidas
  getRequestFriends(): Observable<FriendSummary[]> {
    return this.remoteService.getRequestFriends().pipe(
      map((data: FriendSummary[]) => data || []),
      catchError((err: any) => {
        console.error('Error al cargar solicitudes:', err);
        return of([]);
      })
    );
  }

  //Load sentRequest
  getSentRequests(): Observable<FriendSummary[]> {
    return this.remoteService.getSentRequests().pipe(
      map((data: FriendSummary[]) => data || []),
      catchError((err: any) => {
        console.error('Error al cargar solicitudes enviadas:', err);
        return of([]);
      })
    );
  }

  acceptRequest(requestUsername: string) : Observable<boolean | void>{
    return this.remoteService.acceptRequest(requestUsername).pipe(
      tap(() => {
        console.log('Solicitud de amistad aceptada');
        return of(true);
      }),
      catchError((err: any) => {
        console.error('Error al aceptar solicitud:', err);
        return of(false);

      })
    );
  }

}
