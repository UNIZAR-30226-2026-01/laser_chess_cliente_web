import { HttpClient } from '@angular/common/http'; // Para hacer peticiones al Backend
import { inject, Injectable } from '@angular/core'; 
import { HttpResponse } from '@angular/common/http'; // Para manejar respuestas HTTP
// Injectable -> marca la clase como servicio inyectable
// inject -> nueva forma de inyectar dependencias 

import { catchError, Observable, of, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router'; // Para redirigir al usuario

import { LoginRequest } from '../auth/LoginRequest';
import { RegisterRequest } from '../auth/RegisterRequest';

import { API_URL, ACCESS_TOKEN } from '../../constants/app.const';
import { LoginResponse } from '../auth/LoginResponse';
import { UserData } from '../auth/UserData';


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  // Solicitud a la API para iniciar sesión
  login(loginRequest: LoginRequest): Observable<HttpResponse<LoginResponse> | null> {
    return this.http.post<LoginResponse>(`${API_URL}/login`, loginRequest, { observe: 'response' }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during login');
      })
    );
  }

  // Solicitud a la API para registrar un nuevo usuario
  register(registerRequest: RegisterRequest): Observable<HttpResponse<UserData> | null> {
    return this.http.post<UserData>(`${API_URL}/register`, registerRequest, { observe: 'response' }).pipe(
      catchError((err: Error) => {
        throw new Error('Error during registration');
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
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    this.isAuthenticated$.next(true);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN);
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

  refreshToken() {
    // Hacer refresh del access token usando el refresh token
    const accessToken = this.getAccessToken();
    
    // Tengo dudas sobre el refresh token, si me lo pasan como cookie
    return this.http.post<any>(`${API_URL}/refresh`, { expiredAccessToken: accessToken }, { withCredentials: true }).pipe(
      tap((response) => {
        this.setTokens(response.accessToken);
      }),
      catchError(() => {
        this.logout();
        this.logout();
        throw new Error('Session expired');
      })
    );
  }


  logout(): void {
    console.log('User logged out');

    // El usuario ya no está logeado
    this.isAuthenticated$.next(false);

    // Eliminamos tokens
    localStorage.removeItem(ACCESS_TOKEN);
    this.router.navigate(['/start']);
    
  }

}