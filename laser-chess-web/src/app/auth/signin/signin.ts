import { Component, inject } from '@angular/core';
import { API_URL } from '../../constants/app.const';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { RegisterRequest } from '../../message/RegisterRequest';
import { LoginResponse } from '../../message/LoginResponse';


@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class Signin {
  RegisterForm!: FormGroup;
  private authService: Auth = inject(Auth);
  private router: Router = inject(Router);
  private registerRequest!: RegisterRequest;

  ngOnInit() {
    this.RegisterForm = new FormGroup({
      mail: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [Validators.required]), // Falta validación de que no tenga @
      password: new FormControl('', [Validators.required, Validators.minLength(6)]) // Añadir más validaciones
    })
  }

  register() {
    if (this.RegisterForm.valid) {
      this.registerRequest = {
        mail: this.RegisterForm.value.mail,
        username: this.RegisterForm.value.username,
        password: this.RegisterForm.value.password
      };
      this.authService.register(this.registerRequest).subscribe(
        (response: LoginResponse | null) => {
          console.log('User registered successfully', response);
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

