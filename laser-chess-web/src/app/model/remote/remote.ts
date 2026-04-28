import { HttpClient } from '@angular/common/http'; // Para hacer peticiones al Backend
import { inject, Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http'; // Para manejar respuestas HTTP


import { catchError, Observable, tap, BehaviorSubject, of, map, throwError } from 'rxjs';
import { Router } from '@angular/router'; // Para redirigir al usuario

import { LoginRequest } from '../auth/LoginRequest';
import { RegisterRequest } from '../auth/RegisterRequest';

import { API_URL, ACCESS_TOKEN, ACCOUNT_ID } from '../../constants/app.const';
import { LoginResponse } from '../auth/LoginResponse';
import { AccountResponse } from '../auth/AccountResponse';

import { FriendSummary } from '../social/FriendSummary';
import { UpdateAccountRequest } from '../auth/UpdateAccountRequest'
import { FriendshipRequest } from '../social/FriendshipRequest';
import { ChallengeResume } from '../game/ChallengeResume';
import { XpInfo } from '../user/ProfileCardData';

import { AllRatingsDTO } from '../rating/AllRatingsDTO';
import { GameResume } from '../game/GameResume';

import { ShopItemDTO } from '../shop/ShopItemDTO';

import { SseService } from '../notifications/sse';


@Injectable({
  providedIn: 'root'
})
export class Remote {
  public  isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);
  private accessToken: string = "";
  private accountId: number | null = null;

  private sseService = inject(SseService);


  constructor() {
    this.cargarTokenDelAlmacenamiento();
    this.cargarAccountId();

  }

  private cargarTokenDelAlmacenamiento(): void {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      this.accessToken = token;
      this.isAuthenticated$.next(true);
    }
  }

  private cargarAccountId(): void {
    const stored = localStorage.getItem(ACCOUNT_ID);
    if (stored) {
      this.accountId = Number(stored);
    }
  }


  getAccountIdFromToken(): number | null {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? null;
    } catch (e) {
      console.error("Error decodificando token", e);
      return null;
    }
  }

  setAccountId(id: number) {
    this.accountId = id;
    localStorage.setItem(ACCOUNT_ID, id.toString());
  }

  getAccountId(): number | null {
    if (this.accountId !== null) return this.accountId;

    const idFromToken = this.getAccountIdFromToken();
    if (idFromToken !== null) {
      this.accountId = idFromToken;
      return idFromToken;
    }

    const stored = localStorage.getItem(ACCOUNT_ID);
    if (stored) {
      this.accountId = Number(stored);
      return this.accountId;
    }

    return null;
  }


  // Solicitud a la API para iniciar sesión
  login(loginRequest: LoginRequest): Observable<HttpResponse<LoginResponse> | null> {
    console.log('Login called', loginRequest);
    return this.http.post<LoginResponse>(`http:${API_URL}/login`, loginRequest, { observe: 'response', withCredentials: true }).pipe(
      tap((response) => {
        console.log('Login response', response);
        if (response.body?.access_token) {
          this.setTokens(response.body.access_token);
        }
      }),
      catchError((err) => {
        console.error('Login HTTP error', err);
        return throwError(() => err); // así llega al subscribe.error
      })
    );
  }

  // Solicitud a la API para registrar un nuevo usuario
  register(registerRequest: RegisterRequest): Observable<HttpResponse<AccountResponse> | null> {
    return this.http.post<AccountResponse>(`http:${API_URL}/register`, registerRequest, { observe: 'response' }).pipe(
      catchError((err: Error) => {
        throw err;
      })
    );
  }

  // Solicitud a la API para obtener los detalles de una cuenta
  getAccount(id_account: number){
    return this.http.get<AccountResponse>(`http:${API_URL}/api/account/${id_account}`, { observe: 'response' }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during getting info from de account with id_account');
      })
    );
  }

  getOwnAccount() {
      return this.http.get<AccountResponse>(`http:${API_URL}/api/account/`).pipe(
        catchError((err: Error) => {
          throw new Error('Error during getting own account info');
        })
      );
    }

  // Solicitud a la API para actualizar los dellates de la cuenta
  updateAccount(updateRequest: UpdateAccountRequest){
    return this.http.post<AccountResponse>(`${API_URL}/api/account/update`, updateRequest, { observe: 'response' }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during updating account');
      })
    );
  }

  // Solicitud a a la API para borrar la cuenta
  deleteAccount(): Observable<void>{
    return this.http.delete<void>(`${API_URL}/api/account/delete`).pipe(
      catchError(err => {
        console.error('Error eliminando cuenta', err);
        return throwError(() => new Error('No se pudo eliminar la cuenta'));
      })
    );
  }


  // Solicitud a la API para cambiar la constrseña
  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${API_URL}/api/account/passwd`, {
      old_password: oldPassword,
      new_password: newPassword
    }).pipe(
      catchError(err => {
        console.error('Error cambiando contraseña', err);
        return throwError(() => new Error('No se pudo cambiar la contraseña'));
      })
    );
  }

  // Solicitud a la API para obtener la info de la barra de xp
  getXpInfo(): Observable<XpInfo> {
    return this.http.get<XpInfo>(`http:${API_URL}/api/account/xp`, { observe: 'body' });
  }

  // Solicitud a la API para obtener listado de amigos
  getFriends() : Observable<FriendSummary[]>{
    return this.http.get<FriendSummary[]>(`http:${API_URL}/api/friendship`, {
    //headers: { Authorization: `Bearer ${this.accessToken}`}
    }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during getting info about friends');
      })
    );
  }

  // Solicitud a la API para obtener listado de solicitudes de amistad pendientes
  getRequestFriends() : Observable<FriendSummary[]>{
    return this.http.get<FriendSummary[]>(`http:${API_URL}/api/friendship/pending`, {
    //headers: {Authorization: `Bearer ${this.accessToken}`}
    }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during getting info about friend requests');
      })
    );
  }

  // Solicitud a la API para obtener listado de solicitudes de amistad enviadas pendientes
  getSentRequests(): Observable<FriendSummary[]> {
    return this.http.get<FriendSummary[]>(`${API_URL}/api/friendship/sent`, {
      //headers: { Authorization: `Bearer ${this.accessToken}`}
    }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during getting info about sent friend requests');
      })
    );
  }

  // Solicitud a la API para enviar una solicitud de amistad
  addFriend(request:FriendshipRequest) : Observable<void> {
    return this.http.post<void>(`http:${API_URL}/api/friendship`, request , {
    //headers: {Authorization: `Bearer ${this.accessToken}`}
    }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during adding friend' + err);
      })
    );
  }

  // Solicitud a la API para eliminar un amigo/rechazar una solicitud de amistad
  deleteFriend(friendUsername: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/api/friendship/${friendUsername}`, {
        //headers: {   Authorization: `Bearer ${this.accessToken}`}
    }).pipe(
        catchError((err: Error) => {
            console.error('Error deleting friend:', err);
            throw new Error('Error during deleting friend');
        })
    );
  }

  // Solicitud a la API para aceptar una solicitud de amistad
  acceptRequest(friend: String) : Observable<void> {
    return this.http.put<void>(`${API_URL}/api/friendship/${friend}`, null, {
      //headers: {  Authorization: `Bearer ${this.accessToken}`}

    }).pipe(
      catchError((err: Error) => {
        console.error('Error accepting friend request:', err);
        throw new Error('Error during accepting friend request');
      })
    );
  }




  //---------------------------------------------------------------------------------------------
  //
  // ENDPOINTS PARA LOS RANKIGS
  //
  //----------------------------------------------------------------------------------------------

  // Solicitud a la API para obtener los ratings de un usuario
  getAllRatings(userId: number): Observable<AllRatingsDTO> {
    return this.http.get<AllRatingsDTO>(`${API_URL}/api/rating/${userId}`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err: Error) => {
        console.error('Error getting ratings:', err);
        throw new Error('Error during getting ratings');
      })
    );
  }


  // Solicitud para pillar el Blitz
  getEloBlitz(userId: number): Observable<AllRatingsDTO> {
    return this.http.get<AllRatingsDTO>(`${API_URL}/api/rating/${userId}/blitz`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err: Error) => {
        console.error('Error getting elo Blitz:', err);
        throw new Error('Error during getting Blitz');
      })
    );
  }

  // Solicitud para pillar el Rapid
  getEloRapid(userId: number): Observable<AllRatingsDTO> {
    return this.http.get<AllRatingsDTO>(`${API_URL}/api/rating/${userId}/rapid`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err: Error) => {
        console.error('Error getting elo Rapid:', err);
        throw new Error('Error during getting Rapid');
      })
    );
  }

  // Solicitud para pillar el Clasic
  getEloClasic(userId: number): Observable<AllRatingsDTO> {
    return this.http.get<AllRatingsDTO>(`${API_URL}/api/rating/${userId}/classic`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err: Error) => {
        console.error('Error getting elo Classic:', err);
        throw new Error('Error during getting Classic');
      })
    );
  }

  // Solicitud para pillar el Extended
  getEloExtended(userId: number): Observable<AllRatingsDTO> {
    return this.http.get<AllRatingsDTO>(`${API_URL}/api/rating/${userId}/extended`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err: Error) => {
        console.error('Error getting elo Extended:', err);
        throw new Error('Error during getting Extended');
      })
    );
  }

  // Te dice la posición en el ranking global de un elo de un user
  getMyPositicion(userId: number, eloType: string): Observable<AllRatingsDTO> {
    return this.http.get<AllRatingsDTO>(`${API_URL}/api/rating/ranking/${eloType}/${userId}`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err: Error) => {
        console.error('Error getting mi elo', err);
        throw new Error('Error getting mi elo');
      })
    );
  }

  // Devuelve el top 100 de jugadores con más elo en una categoría
  getBest100(eloType: string): Observable<AllRatingsDTO> {
    return this.http.get<AllRatingsDTO>(`${API_URL}/api/rating/top/${eloType}`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err: Error) => {
        console.error('Error getting los 100', err);
        throw new Error('Error getting los 100');
      })
    );
  }


  //---------------------------------------------------------------------------------------------
  //
  // ENDPOINTS PARA LA SHOP 
  //
  //---------------------------------------------------------------------------------------------

  // Obtener todos los ítems disponibles en la tienda
  listShopItems(): Observable<ShopItemDTO[]> {
    return this.http.get<ShopItemDTO[]>(`${API_URL}/api/item/all`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err) => {
        console.error('Error al obtener la tienda', err);
        return throwError(() => new Error('No se pudo cargar la tienda'));
      })
    );
  }

  // Obtener los ítems que ya tiene el usuario
  getUserItems(): Observable<ShopItemDTO[]> {
    return this.http.get<ShopItemDTO[]>(`${API_URL}/api/item/inventory`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err) => {
        console.error('Error al obtener tus ítems', err);
        return throwError(() => new Error('No se pudieron cargar tus ítems'));
      })
    );
  }

  // Comprar un ítem 
  purchaseItem(itemId: number): Observable<void> {
    const body = { item_id: itemId };
    return this.http.post<void>(`${API_URL}/api/item`, body, {
      //headers: { Authorization: `Bearer ${this.accessToken}` },
      observe: 'body'
    }).pipe(
      catchError((err) => {
        console.error('Error al comprar ítem', err);
        let message = 'Error al comprar';
        if (err.status === 400) message = 'Solicitud incorrecta';
        if (err.status === 402) message = 'No tienes suficiente dinero';
        if (err.status === 403) message = 'No alcanzas el nivel requerido';
        if (err.status === 404) message = 'Ítem no encontrado';
        return throwError(() => new Error(message));
      })
    );
  }


  //---------------------------------------------------------------------------------------------
  //
  // ENDPOINTS PARA LAS PARTIDAS
  //
  //----------------------------------------------------------------------------------------------

  // Solicitud a la API para desafiar a un amigo a una partida
  challengeFriend(friendUsername: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/api/rt/challenge`,
        { opponent_username: friendUsername, game_type: 'friendly' },
        {
            //headers: {    Authorization: `Bearer ${this.accessToken}`}
        }
    ).pipe(
        catchError((err: Error) => {
            console.error('Error challenging friend:', err);
            throw new Error('Error during challenging friend');
        })
    );
  }

  // Solicitud a la API para comprobar si hay solicitudes de partida pendientes
  checkSolicitudes(): Observable<ChallengeResume[]> {
    return this.http.get<ChallengeResume[]>(`${API_URL}/api/rt/challenges`,
          {
              //headers: {Authorization: `Bearer ${this.accessToken}`}
          }
      ).pipe(
          catchError((err: Error) => {
              console.error('Error getting challenge requests:', err);
              throw new Error('Error');
          })
      );
  }

  // Solicitud a la API que revisa si hay partida activa
  checkActiveGame(): Observable<{ inGame: boolean, gameId?: string }> {
    return this.http.get<{ inGame: boolean, gameId?: string }>(`${API_URL}/rt/reconnect`,).pipe(
          catchError((err: Error) => {
              console.error('Error getting active games :', err);
              throw new Error('Error');
          })
      );;
  }

  getPausedGames():  Observable<GameResume[]> {
    return this.http.get<GameResume[]>(`${API_URL}/api/match/history/${this.accountId}/paused`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err: Error) => {
        console.error('Error getting paused games :', err);
        throw new Error('Error');
      })
    );
  }

  getFinishedGames():  Observable<GameResume[]> {
    return this.http.get<GameResume[]>(`${API_URL}/api/match/history/${this.accountId}`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err: Error) => {
        console.error('Error getting paused games :', err);
        throw new Error('Error');
      })
    );
  }



  /*
   * Gestión de tokens y autenticación
   * - setTokens: guarda el access token en la sesión y en el almacenamiento local, y actualiza el estado de autenticación.
   * - hasToken: verifica si hay un token válido en la sesión.
   * - getAccessToken: devuelve el token de acceso actual.
   * - isTokenExpired: comprueba si el token ha expirado.
   * - limpiarPersistencia: elimina los tokens y datos relacionados del almacenamiento local y actualiza el estado de autenticación.
   * - refreshToken: intenta obtener un nuevo access token usando el refresh token, y maneja errores de autenticación.
   * - logout: cierra la sesión eliminando los tokens y redirigiendo al usuario a la página de inicio.
   * - autoLogin: intenta restaurar la sesión automáticamente al cargar la aplicación, verificando el token o usando el refresh token si es necesario.
  */

  setTokens(accessToken: string): void {
    this.accessToken = accessToken;
    localStorage.setItem(ACCESS_TOKEN, accessToken); //Hay que guardarlo para el interceptor

    localStorage.setItem('has_session_hint', 'true');
    // Extraer el ID del payload del token
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.sub) {
        this.setAccountId(parseInt(payload.sub));
      }
    } catch (e) {
      console.error('Error parsing token', e);
    }

    this.isAuthenticated$.next(true);
  }


  private hasToken(): boolean {
    return this.accessToken != null && !this.isTokenExpired(this.accessToken);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;

    try {
      // Comprobación del si el token ha expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  }

  private limpiarPersistencia(): void {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(ACCOUNT_ID);
    localStorage.removeItem('has_session_hint');
    this.accessToken = "";
    this.accountId = null;
    this.isAuthenticated$.next(false);
  }

  // Y lo usas en el refreshToken
  refreshToken() {
    return this.http.post<any>(`${API_URL}/refresh`, {}, { withCredentials: true }).pipe(
      tap((response) => {
        if (response.access_token) {
          this.setTokens(response.access_token);
        }
      }),
      catchError((err) => {
        this.limpiarPersistencia();
        this.router.navigate(['']);
        throw err;
      })
    );
  }


  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(ACCOUNT_ID);
    localStorage.removeItem('has_session_hint');

    this.accessToken = "";
    this.accountId = null;
    this.isAuthenticated$.next(false);

    this.sseService.disconnect();
    this.router.navigate(['']);
  }



  // Intenta restaurar la sesion con el refresh_token para no iniciar sesion todo el rato
  autoLogin(): Observable<boolean> {
    // Mirar si esta autenticado
    if (this.hasToken()) {
      return of(true);
    }

    //No lo esta, nuevo access_token con el refresh_token
    const haySesionPrevia = localStorage.getItem('has_session_hint') === 'true';

    if (!haySesionPrevia) {
      // El usuario definitivamente no está logeado.
      return of(false);
    }
    return this.refreshToken().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

}
