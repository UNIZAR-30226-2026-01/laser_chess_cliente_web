import { Component, inject, signal} from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';
import { Remote } from '../../model/remote/remote';
import { UpdateAccountRequest } from '../../model/auth/UpdateAccountRequest'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../auth/signin/signin';
import { ResponseStatus } from '../../model/auth/ResponseStatus';
import { LoginRequest } from '../../model/auth/LoginRequest';


@Component({
  selector: 'app-settings',
  imports: [TopRow, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private remoteService = inject(Remote);
  public popUpPasswd = signal(false);
  public popUpSuccess = signal(false);
  public showError = signal(false);
  public errorMessage = signal('');

  changePasswdGroup!: FormGroup;
  public formSubmitted = signal(false);


  ngOnInit() {
      this.changePasswdGroup = new FormGroup({
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50)
        ]),
        password_rep: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50)
        ]),
       }, { validators: passwordMatchValidator }); 
      
    }

  changePasswd(){
    console.log("Change password");
    this.popUpPasswd.set(true);
    // Falta actualizar que update el password
    // updateData(username: string , mail: String, board_skin: number, piece_skin: number, win_animation: number)
    this.formSubmitted.set(true);
      
    if (this.changePasswdGroup.invalid) {
      console.warn('Form not valid');
      return;
    }
    /*
    const request: UpdatePasswdRequest = {
    // Aún no sabemos que hay que pasarle al backend
      credential: this.changePasswdGroup.value.credential,
      password: this.changePasswdGroup.value.password
    };
        
    // Llamada al servicio Auth.login
    this.authService.updatePasswd(request).subscribe((status) => {
      switch(status){  
        case ResponseStatus.SUCCESS:
          this.popUpPasswd.set(true);
          this.formSubmitted.set(false);
          this.showError.set(false);
          this.errorMessage.set('');
            break;
        case ResponseStatus.FAILURE:
          this.showError.set(true);
          this.loginForm.reset();
          this.errorMessage.set('Cambio de contraseña no válido');
          break;
        case ResponseStatus.ERR_CONNECTION:
          this.showError.set(true);
          this.loginForm.reset();
          this.errorMessage.set('Cambio de contraseña fallido');
          break;
      }}
    );
        */
  }

  

  logout(){
    console.log("Logout");
    this.remoteService.logout();
  }

  deleteAccount(){
    console.log("Delete account");
    this.remoteService.deleteAccount();
  }

}
