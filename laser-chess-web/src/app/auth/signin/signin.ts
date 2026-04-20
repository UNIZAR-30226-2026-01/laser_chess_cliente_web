import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterRequest } from '../../model/auth/RegisterRequest';
import { signal } from '@angular/core';
import { AuthRepository } from '../../repository/auth-repository';
import { ResponseStatus } from '../../model/auth/ResponseStatus';
import { RouterLink } from '@angular/router';


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
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})


export class Signin {
  RegisterForm!: FormGroup;
  public formSubmitted = signal(false);


  private authService = inject(AuthRepository);
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
      username: this.RegisterForm.value.username,
      password: this.RegisterForm.value.password,
      mail: this.RegisterForm.value.mail
      
    };
  
    // Llamada al servicio Auth.login
    this.authService.register(request).subscribe((status) => {
      switch (status) {
        case ResponseStatus.SUCCESS:
          console.log('Registration successful');
          this.router.navigate(['login']);
          break;

        case ResponseStatus.FAILURE:
          console.warn('Registration failed: Invalid credentials');
          this.showError.set(true);
          this.errorMessage.set('Registration failed: Invalid credentials');
          break;

        case ResponseStatus.ERR_CONNECTION:
          console.error('Registration failed: Connection error');
          this.showError.set(true);
          this.errorMessage.set('Registration failed: Connection error');
          break;
      }
    });
  }
}