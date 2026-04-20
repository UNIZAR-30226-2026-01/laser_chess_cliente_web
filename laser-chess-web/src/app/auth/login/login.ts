import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from '../../model/auth/LoginRequest';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { AuthRepository } from '../../repository/auth-repository';
import { ResponseStatus } from '../../model/auth/ResponseStatus';
import { Remote } from '../../model/remote/remote';
import { NotificationService } from '../../model/notifications/notification';




@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

export class Login implements OnInit {
  loginForm!: FormGroup;
  public formSubmitted = signal(false);

  private authService = inject(AuthRepository);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private remote = inject(Remote);
  public showError = signal(false);
  public errorMessage = signal('');

  ngOnInit() {
    // Configuación del formulario de login con validaciones
    this.loginForm = new FormGroup({
      credential: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$|^\w+$/) // email o username
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50)
      ]),
    });
  }


  login() {
      this.formSubmitted.set(true);
  
      if (this.loginForm.invalid) {
        console.warn('Form not valid');
        return;
      }
    
      const request: LoginRequest = {
        credential: this.loginForm.value.credential,
        password: this.loginForm.value.password
      };
    
      // Llamada al servicio Auth.login
      this.authService.login(request).subscribe((status) => {
      switch(status){  
        case ResponseStatus.SUCCESS:
          const userId = this.remote.getAccountId();
          if (userId) {
            this.notificationService.setupAfterLogin(userId);
          }
          this.router.navigate(['home']);
          this.showError.set(false);
          this.errorMessage.set('');
          break;
        case ResponseStatus.FAILURE:
          this.showError.set(true);
          this.loginForm.reset();
          this.errorMessage.set('Login failed');
          break;
        case ResponseStatus.ERR_CONNECTION:
          this.showError.set(true);
          this.loginForm.reset();
          this.errorMessage.set('Usuario/mail o contraseña incorrectos');
          break;
      }}
    );
  }

           
}