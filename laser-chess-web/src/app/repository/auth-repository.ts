import { Injectable, inject} from '@angular/core';
import { Remote } from '../model/remote/remote';
import { RegisterRequest } from '../model/auth/RegisterRequest';
import { ResponseStatus } from '../model/auth/ResponseStatus';
import { LoginRequest } from '../model/auth/LoginRequest';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';



@Injectable({
  providedIn: 'root',
})
export class AuthRepository {
  private remoteService = inject(Remote);

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
            return ResponseStatus.FAILURE;
          }
        }),
        catchError((err) => {
          console.error(err);
          return of(ResponseStatus.ERR_CONNECTION);
        })
      );
  }

  register(request: RegisterRequest): Observable<ResponseStatus> {
  return this.remoteService.register(request).pipe(
    map((httpResponse) => {
      if (httpResponse && httpResponse.body) {
        this.remoteService.setAccountId(httpResponse.body.account_id);
        return ResponseStatus.SUCCESS;
      } else {
        return ResponseStatus.FAILURE;
      }
    }),
    catchError((err) => {
      console.error(err);
      return of(ResponseStatus.ERR_CONNECTION);
    })
  );
}
  

  logout() : void {
    this.remoteService.logout();
  }

  
}
