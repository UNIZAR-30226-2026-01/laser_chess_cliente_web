import { Component, inject } from '@angular/core';
import { API_URL } from '../../constants/app.const';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../model/remote/auth';
import { RegisterRequest } from '../../message/RegisterRequest';
import { UserData } from '../../message/UserData';
import { signal } from '@angular/core';

export const passwordMatchValidator: ValidatorFn =
  (control: AbstractControl): ValidationErrors | null => {

    const password = control.get('password')?.value;
    const passwordRep = control.get('password_rep')?.value;

    if (!password || !passwordRep) {
      return null;
    }

    return password === passwordRep
      ? null
      : { passwordMismatch: true };
};

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})


export class Signin {
  RegisterForm!: FormGroup;
  private authService = inject(Auth);
  private router = inject(Router);
  public showError = signal(false);
  public errorMessage = signal('');
  

  ngOnInit() {
    this.RegisterForm = new FormGroup({
      mail: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$|^\w+$/) // email
      ]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      password_rep: new FormControl('', [Validators.required]),
     }, { validators: passwordMatchValidator }); 
    
  }

  
  
  register() {
    if (this.RegisterForm.invalid) {
      console.warn('Form not valid');
      return;
    }
  
    const request: RegisterRequest = {
      mail: this.RegisterForm.value.mail,
      username: this.RegisterForm.value.username,
      password: this.RegisterForm.value.password
    };
  
    // Llamada al servicio Auth.login
    this.authService.register(request).subscribe({
      next: (httpResponse) => {
        if (httpResponse && httpResponse.body) {
          console.log('User registered successfully');
          this.router.navigate(['login']);
          this.showError.set(false);
          this.errorMessage.set('');

        } else {
          this.showError.set(true);
          this.errorMessage.set('Registro fallido');
        }
      },
      error: (err) => {
        console.error('HTTP error during registration', err);
        this.showError.set(true);
        this.errorMessage.set('Error al registrar el usuario');
      }
    });
  }
}