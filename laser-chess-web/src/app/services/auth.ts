import { HttpClient } from '@angular/common/http'; // Para hacer peticiones al Backend
import { inject, Injectable } from '@angular/core'; 
import { HttpResponse } from '@angular/common/http'; // Para manejar respuestas HTTP
// Injectable -> marca la clase como servicio inyectable
// inject -> nueva forma de inyectar dependencias 

import { catchError, Observable, of } from 'rxjs';
import { Router } from '@angular/router'; // Para redirigir al usuario

import { LoginRequest } from '../message/LoginRequest';
import { RegisterRequest } from '../message/RegisterRequest';

import { API_URL } from '../constants/app.const';


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private isAuthenticated$ = false; // new BehaviorSubject<boolean>(this.hasToken());

  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  // Solicitud a la API para iniciar sesión
  login(loginRequest: LoginRequest): Observable<HttpResponse<unknown> | null> {
    return this.http.post(`${API_URL}/Auth/Login`, loginRequest,{ observe: 'response' }).pipe(
      catchError((err: Error) => {
        return of(null);
      })
    );
  }

  // Solicitud a la API para registrar un nuevo usuario
  register(registerRequest: RegisterRequest): Observable<HttpResponse<unknown> | null> {
    return this.http.post(`${API_URL}/Auth/Register`, registerRequest, { observe: 'response' }).pipe(
      catchError((err: Error) => {
        return of(null);
      })
    );
  }

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  MOVIDAS DE TOKENS
  - ACCESS TOKEN
  - REFRESH TOKEN 

  -> PENDIENTE DE IMPLEMENTAR EN BACKEND Y REVISAR EN FRONTEND

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.isAuthenticated$.next(true);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  }

  refreshToken() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return;
    }

    return this.http.post<any>(`${API_URL}/Auth/refreshToken`, { expiredAccessToken: accessToken, refreshToken }).pipe(
      tap((response) => {
        this.setTokens(response.accessToken, response.refreshToken);
      }),
      catchError(() => {
        this.logout();
        this.clearSession();
        throw new Error('Session expired');
      })
    );
  }
*/
  clearSession(): void {
    // localStorage.removeItem(ACCESS_TOKEN_KEY);
    // localStorage.removeItem(REFRESH_TOKEN_KEY);
    // this.isAuthenticated$.next(false);
    this.router.navigate(['/start']);
  }

  logout(): void {
    // codigo pendiente
    console.log('User logged out');
    this.clearSession();
  }

}