import { Component, inject } from '@angular/core';
import { API_URL } from '../../constants/app.const';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { LoginRequest } from '../../message/LoginRequest';
import { LoginResponse } from '../../message/LoginResponse';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm!: FormGroup;
  private authService: Auth = inject(Auth);
  private router: Router = inject(Router);
  private loginUserRequest!: LoginRequest;

  ngOnInit() {
    this.loginForm = new FormGroup({
      credential: new FormControl('', [Validators.required, Validators.email]),
      // Puede ser el email o el username -> comprobar
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  login() {
    if (this.loginForm.valid) {
      this.loginUserRequest = {
        credential: this.loginForm.value.credential,
        password: this.loginForm.value.password,
      };
      this.authService.login(this.loginUserRequest).subscribe(
        (response: LoginResponse | null) => {
          console.log('User logged in successfully', response);
          // this.authService.setTokens(response!.accessToken, response!.refreshToken)
          this.router.navigate(['home']);
        },
        (error: Error) => {
          this.router.navigate(['error']);
        }
      );
    } else {
      console.log("Form not valid");
    }
  }

}