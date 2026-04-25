import { Injectable, inject} from '@angular/core';
import { Remote } from '../model/remote/remote';
import { RegisterRequest } from '../model/auth/RegisterRequest';
import { ResponseStatus } from '../model/auth/ResponseStatus';
import { LoginRequest } from '../model/auth/LoginRequest';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';


/*
 * AuthRepository : El AuthRepository agrupa toda la lógica asociada al dominio de autenticación de la aplicación.
 * Dependencia: Remote
 * Responsabilidades:
 * - Manejar el proceso de inicio de sesión.
 * - Manejar el proceso de registro.
 * - Manejar el proceso de cierre de sesión.
 * - Gestionar el almacenamiento de tokens y datos relacionados con la autenticación.
*/


@Injectable({
  providedIn: 'root',
})
export class AuthRepository {
  private remoteService = inject(Remote);

  // Gestión de proceso de login
  login(request: LoginRequest) : Observable<ResponseStatus>{
    return this.remoteService.login(request).pipe(
      map((httpResponse) => {
        if (httpResponse && httpResponse.body) {
            this.remoteService.setTokens(httpResponse.body.access_token);
            const id = this.remoteService.getAccountIdFromToken();
            if (id) this.remoteService.setAccountId(id);
            console.log('User logged in successfully', httpResponse.body);
            return ResponseStatus.SUCCESS;
  
          } else {
            return ResponseStatus.INVALID_DATA;
          }
        
        }),
        catchError((err) => {
          console.error(err);
          if(err.status === 401){
            // El usuario ya existe
            console.log("Credenciales incorrectas");
            return of(ResponseStatus.INVALID_CREDENTIALS);
            
          }else if(err.status === 400){
            // Datos inválidos
            console.log("Los datos son inválidos");
            return of(ResponseStatus.INVALID_DATA);
          }else{
            console.log("Tas borrachito");
            return of(ResponseStatus.ERR_CONNECTION);
          }
        })
      );
  }

  // Gestión de proceso de registro (creación de cuenta)
  register(request: RegisterRequest): Observable<ResponseStatus> {
    return this.remoteService.register(request).pipe(
      map((httpResponse) => {
        if(httpResponse === null){ return ResponseStatus.ERR_CONNECTION;}
        
        if (httpResponse && httpResponse.body) {
          this.remoteService.setAccountId(httpResponse.body.account_id);
          return ResponseStatus.SUCCESS;
        }
        return ResponseStatus.INVALID_DATA;

        

      }),
      catchError((err) => {
        console.error(err);
        if(err.status === 409){
          // El usuario ya existe
          console.log("El usuario ya existe");
          return of(ResponseStatus.USER_ALREADY_EXISTS);
          
        }else if(err.status === 400){
          // Datos inválidos
          console.log("Los datos son inválidos");
          return of(ResponseStatus.INVALID_DATA);
        }else{
          console.log("Tas borrachito");
          return of(ResponseStatus.ERR_CONNECTION);
        }
      })
    );
  }
  
  // Gestión de proceso de cerrar sesión (borrado de tokens y datos relacionados con la autenticación)
  logout() : void {
    this.remoteService.logout();
  }

  
}
