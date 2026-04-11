import { Injectable, inject} from '@angular/core';
import { Remote } from '../model/remote/remote';
import { Observable, of } from 'rxjs';
import { tap, catchError, map} from 'rxjs/operators';
import { FriendshipRequest } from '../model/social/FriendshipRequest';
import { FriendSummary } from '../model/social/FriendSummary'
import { AllRatingsDTO } from '../model/rating/AllRatingsDTO';


/*
 * FriendRepository : El FriendRepository agrupa toda la lógica asociada al dominio social de la aplicación.
 * Dependencia: Remote
 * Responsabilidades:
 * - Obtener la lista de amigos del usuario.
 * - Gestionar las solicitudes de amistad (enviar, aceptar, rechazar).
 * - Eliminar amigos de la lista.
 * - Cargar las solicitudes de amistad recibidas y enviadas.
 * 
*/

@Injectable({
  providedIn: 'root',
})
export class FriendRespository {
  private remoteService = inject(Remote);

  // Obtenición de listado de amigos del usuario
  getFriends(): Observable<FriendSummary[]> {
    return this.remoteService.getFriends().pipe(
      map((data: FriendSummary[]) => data || []),
      catchError((err: any) => {
        console.error('Error al cargar amigos:', err);
        return of([]);
      })
    );
  }

  // Obtenición de retings del usuario dado
  getAllRatings(userIdNumber: number) : Observable<AllRatingsDTO> {
    return this.remoteService.getAllRatings(userIdNumber).pipe();

  }

  // Gestión de proceso de envio de solicitud de amistad
  addFriend(request: FriendshipRequest ) : Observable<boolean | void> {
    return this.remoteService.addFriend(request).pipe(
      tap(() => {
        console.log('Solicitud de amistad enviada');
      }),
      map(() => true),
      catchError((err: any) => {
        console.error(err);
        return of(false);
      })
    );
  }

  // Gestión de proceso de borrado de amigos (borrado de amigos o rechazar solicitud emitida/recibida)
  deleteFriend(friendUsername: string) : Observable<boolean | void> {
    return this.remoteService.deleteFriend(friendUsername).pipe(
      tap(() => {
        console.log('Amigo eliminado:', friendUsername);
        // Recargar la lista de amigos
      }),
      map(() => true),
      catchError((err: any) => {
        console.error('Error al eliminar amigo:', err);
        return of(false);
      })
    );
  }
        

  // Cargar solicitudes de amistad recibidas
  getRequestFriends(): Observable<FriendSummary[]> {
    return this.remoteService.getRequestFriends().pipe(
      map((data: FriendSummary[]) => data || []),
      catchError((err: any) => {
        console.error('Error al cargar solicitudes:', err);
        return of([]);
      })
    );
  }

  // Cargar solicitudes de amistad enviadas
  getSentRequests(): Observable<FriendSummary[]> {
    return this.remoteService.getSentRequests().pipe(
      map((data: FriendSummary[]) => data || []),
      catchError((err: any) => {
        console.error('Error al cargar solicitudes enviadas:', err);
        return of([]);
      })
    );
  }

  // Gestor de proceso de aceptación de solicitud de amistad
  acceptRequest(requestUsername: string) : Observable<boolean | void>{
    return this.remoteService.acceptRequest(requestUsername).pipe(
      tap(() => {
        console.log('Solicitud de amistad aceptada');
      }),
      map(() => true),
      catchError((err: any) => {
        console.error('Error al aceptar solicitud:', err);
        return of(false);

      })
    );
  }

}
