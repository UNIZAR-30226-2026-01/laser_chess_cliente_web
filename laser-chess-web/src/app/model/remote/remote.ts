import { HttpClient } from '@angular/common/http'; // Para hacer peticiones al Backend
import { inject, Injectable } from '@angular/core'; 
import { HttpResponse } from '@angular/common/http'; // Para manejar respuestas HTTP
// Injectable -> marca la clase como servicio inyectable
// inject -> nueva forma de inyectar dependencias 

import { catchError, Observable, tap, BehaviorSubject, of, map } from 'rxjs';
import { Router } from '@angular/router'; // Para redirigir al usuario

import { LoginRequest } from '../auth/LoginRequest';
import { RegisterRequest } from '../auth/RegisterRequest';

import { API_URL, ACCESS_TOKEN, ACCOUNT_ID } from '../../constants/app.const';
import { LoginResponse } from '../auth/LoginResponse';
import { AccountResponse } from '../auth/AccountResponse';

import { FriendSummary } from '../social/FriendSummary';
import { UpdateAccountRequest } from '../auth/UpdateAccountRequest'
import { FriendshipRequest } from '../social/FriendshipRequest';
import { ChallengeResume } from '../game/ChallengeResume'; // Ajusta la ruta

import { AllRatingsDTO } from '../rating/AllRatingsDTO'; //Para los elos en los perfiles



@Injectable({
  providedIn: 'root'
})
export class Remote {
  public  isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken()); //Para poder usarlo en guard
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);
  private accessToken: string = "";

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

  private accountId: number | null = null;

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

    // 👇 NUEVO: sacarlo del token
    const idFromToken = this.getAccountIdFromToken();
    if (idFromToken !== null) {
      this.accountId = idFromToken;
      return idFromToken;
    }

    // fallback (por si acaso)
    const stored = localStorage.getItem(ACCOUNT_ID);
    if (stored) {
      this.accountId = Number(stored);
      return this.accountId;
    }

    return null;
  }

  
  /*--------------- LOGIN ---------------*/ 
  // Solicitud a la API para iniciar sesión
  login(loginRequest: LoginRequest): Observable<HttpResponse<LoginResponse> | null> {
    return this.http.post<LoginResponse>(`http:${API_URL}/login`, loginRequest, { observe: 'response', withCredentials: true }).pipe( //WithCredentials es para los interceptores
      tap((response) => {
        if (response.body?.access_token) {
          this.setTokens(response.body.access_token);
        }
      }),
      catchError((err: Error) => {
        throw new Error('Error during login');
      })
    );
  }

  // Solicitud a la API para registrar un nuevo usuario
  register(registerRequest: RegisterRequest): Observable<HttpResponse<AccountResponse> | null> {
    return this.http.post<AccountResponse>(`http:${API_URL}/register`, registerRequest, { observe: 'response' }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during registration');
      })
    );
  }

  // Solicitud a la API para obtener los detalles de la cuenta
  // Conviene tener varias llamadas -> solo info de la caja (todas las pantallas)
  getAccount(id_account: number){
    return this.http.get<AccountResponse>(`http:${API_URL}/api/account/${id_account}`, { observe: 'response' }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during getting info from de account with id_account');
      })
    );
  }

  // Solicitud a la API para actualizar los dellates de la cuenta
  updateAccount(updateRequest: UpdateAccountRequest){
    return this.http.post<AccountResponse>(`http:${API_URL}/account/update`, updateRequest, { observe: 'response' }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during updating account');
      })
    );
  }

  // Solicitud a a la API para borrar la cuenta
  deleteAccount(){
    return this.http.post(`${API_URL}/account/delete`, { observe: 'response' }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during deleteing account');
      })
    );
  }

  /*--------------- SOCIAL ---------------*/ 
  getFriends() : Observable<FriendSummary[]>{
    return this.http.get<FriendSummary[]>(`http:${API_URL}/api/friendship`, {
    //headers: { Authorization: `Bearer ${this.accessToken}`}
    }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during getting info about friends');
      })
    );
  }

  getRequestFriends() : Observable<FriendSummary[]>{
    return this.http.get<FriendSummary[]>(`http:${API_URL}/api/friendship/pending`, {
    //headers: {Authorization: `Bearer ${this.accessToken}`}
    }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during getting info about friend requests');
      })
    );
  }

  getSentRequests(): Observable<FriendSummary[]> {
    return this.http.get<FriendSummary[]>(`${API_URL}/api/friendship/sent`, {
      //headers: { Authorization: `Bearer ${this.accessToken}`}
    }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during getting info about sent friend requests');
      })
    );
  }

  addFriend(request:FriendshipRequest) : Observable<void> {
    return this.http.post<void>(`http:${API_URL}/api/friendship`, request , {
    //headers: {Authorization: `Bearer ${this.accessToken}`}
    }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during adding friend');
      })
    );
  }

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

  getAllRatings(userId: number): Observable<AllRatingsDTO> {
    return this.http.get<AllRatingsDTO>(`${API_URL}/rating/elos/${userId}`, {
      //headers: { Authorization: `Bearer ${this.accessToken}` }
    }).pipe(
      catchError((err: Error) => {
        console.error('Error getting ratings:', err);
        throw new Error('Error during getting ratings');
      })
    );
  }

  //Como tal no esta aun pero aproximacion
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

// partida.service.ts

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


  






/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  MOVIDAS DE TOKENS
  - ACCESS TOKEN
  - REFRESH TOKEN 

  -> PENDIENTE DE IMPLEMENTAR EN BACKEND Y REVISAR EN FRONTEND
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

  // En tu clase Remote
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
      this.limpiarPersistencia(); // <--- Aquí es donde se borra el "hint" si la sesión expiró
      this.router.navigate(['/start']);
      throw err;
    })
  );
}


  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(ACCOUNT_ID);
    localStorage.removeItem('has_session_hint'); // IMPORTANTE
    
    this.accessToken = "";
    this.accountId = null;
    this.isAuthenticated$.next(false);
    this.router.navigate(['/start']);
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