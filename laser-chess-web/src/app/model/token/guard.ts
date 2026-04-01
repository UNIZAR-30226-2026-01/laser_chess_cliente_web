import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { Remote } from '../remote/remote';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private remote: Remote, private router: Router) {}

  canActivate(): Observable<boolean> {
    // access_token actual es valido, permitir acceso directamente
    const token = this.remote.getAccessToken();
    if (token && !this.remote.isTokenExpired(token)) {
      return this.remote.isAuthenticated$.pipe(
        take(1),
        map(isAuth => {
          if (!isAuth) this.router.navigate(['/start']);
          return isAuth;
        })
      );
    }

    // no valido, intentar auto-login con refresh_token
    return this.remote.autoLogin().pipe(
      switchMap(authenticated => {
        if (authenticated) {
          // token actualizado, puede acceder
          return this.remote.isAuthenticated$.pipe(
            take(1),
            map(() => true)
          );
        } else {
          this.router.navigate(['/start']);
          return [false];
        }
      })
    );
  }
}