import { Component, inject } from '@angular/core';
import { API_URL } from '../../constants/app.const';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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

  forbiddenAt(control: AbstractControl): ValidationErrors | null {
    return control.value && control.value.includes('@') ? { forbiddenAt: true } : null;
  }

  ngOnInit() {
    this.RegisterForm = new FormGroup({
      mail: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [Validators.required, this.forbiddenAt]),
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
        (response) => {
          if (response && response.status === 201) { // Con que empiece con 2 ya es correcto
            console.log('Usuario creado correctamente', response.body);
            this.router.navigate(['home']);
          } else if (response) {
            console.log('Respuesta inesperada', response.status, response.body);
          } else {
            console.log('No se recibió respuesta del servidor');
          }
        },
        (error) => {
          console.error('Error en el registro', error);
          this.router.navigate(['error']);
        }
      );
    } else {
      console.log("Form not valid");
    }
  }

  

}

