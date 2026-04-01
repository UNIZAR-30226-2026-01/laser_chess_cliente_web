import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Remote } from '../remote/remote';



/**
 * Interceptor que se encarga de:
 * - Añadir automáticamente el token de acceso a las peticiones.
 * - Gestionar la renovación del token cuando expira (401) usando el refresh_token en una cookie httpOnly.
 * - Reintentar las peticiones fallidas después de obtener un nuevo token.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;  // si ya se está realizando un refresh para evitar múltiples solicitudes
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private remote: Remote) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.remote.getAccessToken();
    let authReq = req;
    
    //añadir el header de autorización
    if (token && !this.isPublicEndpoint(req.url)) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    //la petición envia las cookies
    if (!authReq.withCredentials) {
      authReq = authReq.clone({ withCredentials: true });
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  //Para ver si una url necesita endpoint publico o no
  private isPublicEndpoint(url: string): boolean {
    return url.includes('/login') || url.includes('/register') || 
           url.includes('/refresh') || url.includes('/logout');
  }

  //Para el error 401 cuando expira el token entonces se recarga
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.remote.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.access_token);
          const newRequest = request.clone({
            headers: request.headers.set('Authorization', `Bearer ${response.access_token}`)
          });
          return next.handle(newRequest);
        }),
        catchError(error => {
          this.isRefreshing = false;
          this.remote.logout();
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          const newRequest = request.clone({
            headers: request.headers.set('Authorization', `Bearer ${token}`)
          });
          return next.handle(newRequest);
        })
      );
    }
  }
}