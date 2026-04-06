import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Remote} from '../../model/remote/remote';
import { LoginRequest } from '../../model/auth/LoginRequest';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';



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

  private authService = inject(Remote);
  private router = inject(Router);
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
      this.authService.login(request).subscribe({
        next: (httpResponse) => {
          if (httpResponse && httpResponse.body) {

            this.authService.setTokens(httpResponse.body.access_token);
            const id = this.authService.getAccountIdFromToken();
            if (id) this.authService.setAccountId(id);
            console.log('User logged in successfully', httpResponse.body);

            console.log('User logged in successfully');
            this.router.navigate(['home']);
            this.showError.set(false);
            this.errorMessage.set('');
  
          } else {
            this.showError.set(true);
            this.errorMessage.set('Login failed');
          }
        },
        error: (err) => {
          console.error('HTTP error during login', err);
          this.showError.set(true);
          this.errorMessage.set('Usuario/mail o contraseña incorrectos');
        }
      });
    }
}