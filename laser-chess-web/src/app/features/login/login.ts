import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from '../../model/auth/LoginRequest';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { AuthRepository } from '../../repository/auth-repository';
import { ResponseStatus } from '../../model/auth/ResponseStatus';
import { Remote } from '../../model/remote/remote';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

export class Login implements OnInit {
  loginForm!: FormGroup;
  public formSubmitted = signal(false);

  private authService = inject(AuthRepository);
  private router = inject(Router);
  private remote = inject(Remote);
  public showError = signal(false);
  public errorMessage = signal('');
  private route = inject(ActivatedRoute);
  returnUrl: string = '/home';  

  ngOnInit() {
    // access_token valido, vamos directo al home
    const token = this.remote.getAccessToken();
    if (token && !this.remote.isTokenExpired(token)) {
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
      this.router.navigateByUrl(this.returnUrl);
    } else {
      // Si no, intentamos recuperar la sesión con el refresh_token
      this.remote.autoLogin().subscribe({
        next: (authenticated) => {
          if (authenticated) {
            this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
            this.router.navigateByUrl(this.returnUrl);
          }
        },
        error: () => {
          // Si falla, pantalla de inicio
        }
      });
    }

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
          
          this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
          this.router.navigateByUrl(this.returnUrl);
          this.showError.set(false);
          this.errorMessage.set('');
          break;
        case ResponseStatus.INVALID_CREDENTIALS:
          this.showError.set(true);
          this.loginForm.reset();
          this.errorMessage.set('Login failed: Invalid credentials');
          break;
        case ResponseStatus.INVALID_DATA:
          this.showError.set(true);
          this.loginForm.reset();
          this.errorMessage.set('Login failed: Invalid data');
          break;
        case ResponseStatus.ERR_CONNECTION:
          this.showError.set(true);
          this.loginForm.reset();
          this.errorMessage.set('Login failed: Connection error');
          break;
      }}
    );
  }

           
}

