import { HttpClient } from '@angular/common/http'; // Para hacer peticiones al Backend
import { inject, Injectable } from '@angular/core'; 
// Injectable -> marca la clase como servicio inyectable
// inject -> nueva forma de inyectar dependencias 

import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router'; // Para redirigir al usuario

import { LoginRequest } from '../message/LoginRequest';
import { LoginResponse } from '../message/LoginResponse';

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, API_URL } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());

  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  login(loginUserRequest: LoginRequest): Observable<LoginResponse | null> {
    return this.http.post<LoginResponse>(`${API_URL}/Auth/Login`, loginUserRequest).pipe(
      catchError((err: Error) => {
        return of(null);
      })
    );
  }

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

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.isAuthenticated$.next(false);
    this.router.navigate(['/auth']);
  }

  logout(): void {
    // codigo pendiente
    console.log('User logged out');
    this.clearSession();
  }

}