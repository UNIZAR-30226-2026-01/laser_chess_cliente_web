import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { LoginRequest } from '../../message/LoginRequest';
import { CommonModule } from '@angular/common';

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

  ngOnInit() {
    this.loginForm = new FormGroup({
      credential: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$|^\w+$/) // email o username
      ]),
      password: new FormControl('', [Validators.required, Validators.minLength(2)])
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
          console.log('User logged in successfully');
          this.router.navigate(['home']);
          // Suponemos que tu backend devuelve tokens en body
          /*
          const body: any = httpResponse.body;
          if (body.accessToken && body.refreshToken) {
            //this.authService.setTokens(body.accessToken, body.refreshToken);
            console.log('User logged in successfully', body);
            this.router.navigate(['home']);
          } else {
            console.error('Login failed: no tokens returned');
            this.router.navigate(['error']);
          }
            */
        } else {
          console.error('Login failed: null response');
          this.router.navigate(['error']);
        }
      },
      error: (err) => {
        console.error('HTTP error during login', err);
        this.router.navigate(['error']);
      }
    });
  }
}