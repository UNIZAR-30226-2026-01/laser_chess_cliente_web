import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { Remote } from '../../model/remote/remote';
import { RegisterRequest } from '../../model/auth/RegisterRequest';
import { signal } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';


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
  public formSubmitted = signal(false);


  private authService = inject(Remote);
  private router = inject(Router);

  public showError = signal(false);
  public errorMessage = signal('');  

  ngOnInit() {
    this.RegisterForm = new FormGroup({
      mail: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      username: new FormControl('', [
        Validators.required,
        Validators.maxLength(50)
      ]),
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

  
  
  register() {
    this.formSubmitted.set(true);

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
          this.authService.setAccountId(httpResponse.body.account_id);

        } else {
          this.showError.set(true);
          this.errorMessage.set('Registro fallido');
          
        }
      },
      error: (err) => {
        console.error('HTTP error during registration', err);
        this.showError.set(true);
        this.errorMessage.set('Ya existe un usuario registrado con ese correo o nombre de usuario');
      }
    });
  }
}