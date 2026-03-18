import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../model/remote/auth';
import { LoginRequest } from '../../message/LoginRequest';
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
  private authService = inject(Auth);
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
      password: new FormControl('', [Validators.required])
    });
  }

  login() {
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
          const body: any = httpResponse.body;
          if (body.access_token) { // Por ahora no recibo el access, solo el refresh
            this.authService.setTokens(body.access_token);
            console.log('User logged in successfully', body);

            // Redirigir a la página principal después del login exitoso
            this.showError.set(false);
            this.errorMessage.set('');
            this.router.navigate(['home']);

          } else {

            // Si no se reciben tokens, mostrar error
            this.showError.set(true);
            this.errorMessage.set('Login failed: no tokens returned');
          }
            
        } 
      },
      error: (err) => {
        // En caso de error HTTP, mostrar mensaje de error
        this.showError.set(true);
        this.errorMessage.set('Usuario/mail o contraseña incorrectos');
      }
    });
  }
}