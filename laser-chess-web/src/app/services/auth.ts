import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private isAuthenticates$ = new BehaviorSubject<boolean>(this.hasToken());
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  login(loginUserRequest: LoginUserRequest): Observable<AuthSessionResponse | null> {
    return this.http.post<AuthSessionResponse>(`${API_BASE_URL}/Auth/Login`, loginUserRequest).pipe(
      catchError((err: Error) => {
        return of(null);
      })
    );
  }

  /* Añadir las funciones de tokens
  
  */
}
