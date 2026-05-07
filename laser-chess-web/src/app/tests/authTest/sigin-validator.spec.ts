import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Signin } from '../../features/signin/signin';
import { AuthRepository } from '../../repository/auth-repository';
import { ResponseStatus } from '../../model/auth/ResponseStatus';

describe('Signin', () => {
  let component: Signin;
  let fixture: ComponentFixture<Signin>;
  let router: Router;
  let authRepoSpy: {
    register: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authRepoSpy = {
      register: vi.fn().mockReturnValue(of(ResponseStatus.SUCCESS)),
    };

    await TestBed.configureTestingModule({
      imports: [Signin],
      providers: [
        provideRouter([]),
        { provide: AuthRepository, useValue: authRepoSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Signin);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    vi.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ------------------------------------------------------------------
  // Crear e inicualizar
  // ------------------------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con los campos mail, username, password y password_rep', () => {
    expect(component.RegisterForm).toBeTruthy();
    expect(component.RegisterForm.get('mail')).toBeTruthy();
    expect(component.RegisterForm.get('username')).toBeTruthy();
    expect(component.RegisterForm.get('password')).toBeTruthy();
    expect(component.RegisterForm.get('password_rep')).toBeTruthy();
  });

  // ------------------------------------------------------------------
  // Mirar el campo mail
  // ------------------------------------------------------------------
  it('debería marcar inválido si el mail está vacío', () => {
    component.RegisterForm.setValue({
      mail: '',
      username: 'usuario',
      password: '123456',
      password_rep: '123456',
    });
    expect(component.RegisterForm.invalid).toBe(true);
    expect(component.RegisterForm.get('mail')?.hasError('required')).toBe(true);
  });

  it('debería marcar inválido si el mail no tiene formato correcto', () => {
    component.RegisterForm.setValue({
      mail: 'aaaaaaaaaaa',
      username: 'usuario',
      password: '123456',
      password_rep: '123456',
    });
    expect(component.RegisterForm.invalid).toBe(true);
    expect(component.RegisterForm.get('mail')?.hasError('email')).toBe(true);
  });

  it('debería marcar válido con un mail correcto', () => {
    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: '123456',
      password_rep: '123456',
    });
    expect(component.RegisterForm.get('mail')?.valid).toBe(true);
  });

  // ------------------------------------------------------------------
  // Mirar el tamaño del nombre
  // ------------------------------------------------------------------
  it('debería marcar inválido si el username está vacío', () => {
    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: '',
      password: '123456',
      password_rep: '123456',
    });
    expect(component.RegisterForm.invalid).toBe(true);
    expect(component.RegisterForm.get('username')?.hasError('required')).toBe(true);
  });

  it('debería marcar inválido si el username tiene más de 50 caracteres', () => {
    const longUsername = 'a'.repeat(51);
    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: longUsername,
      password: '123456',
      password_rep: '123456',
    });
    expect(component.RegisterForm.invalid).toBe(true);
    expect(component.RegisterForm.get('username')?.hasError('maxlength')).toBe(true);
  });

  it('debería marcar válido si el username tiene 50 caracteres o menos', () => {
    const validUsername = 'a'.repeat(50);
    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: validUsername,
      password: '123456',
      password_rep: '123456',
    });
    expect(component.RegisterForm.get('username')?.valid).toBe(true);
  });

  // ------------------------------------------------------------------
  // Mirar el tamaño de las constraseñas
  // ------------------------------------------------------------------
  it('debería marcar inválido si el password está vacío', () => {
    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: '',
      password_rep: '',
    });
    expect(component.RegisterForm.invalid).toBe(true);
    expect(component.RegisterForm.get('password')?.hasError('required')).toBe(true);
  });

  it('debería marcar inválido si el password tiene menos de 6 caracteres', () => {
    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: '123',
      password_rep: '123',
    });
    expect(component.RegisterForm.invalid).toBe(true);
    expect(component.RegisterForm.get('password')?.hasError('minlength')).toBe(true);
  });

  it('debería marcar inválido si el password tiene más de 50 caracteres', () => {
    const longPassword = 'a'.repeat(51);
    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: longPassword,
      password_rep: longPassword,
    });
    expect(component.RegisterForm.invalid).toBe(true);
    expect(component.RegisterForm.get('password')?.hasError('maxlength')).toBe(true);
  });

  // ------------------------------------------------------------------
  // Mirar si las constraseñas son iguales
  // ------------------------------------------------------------------
  it('debería marcar error de mismatch si password y password_rep no coinciden', () => {
    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: '123456',
      password_rep: '654321',
    });
    expect(component.RegisterForm.hasError('passwordMismatch')).toBe(true);
    expect(component.RegisterForm.valid).toBe(false);
  });

  it('no debería tener error de mismatch si las contraseñas coinciden', () => {
    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: '123456',
      password_rep: '123456',
    });
    expect(component.RegisterForm.hasError('passwordMismatch')).toBe(false);
    expect(component.RegisterForm.valid).toBe(true);
  });

  // ------------------------------------------------------------------
  // Tests register
  // ------------------------------------------------------------------
  it('debería poner formSubmitted a true al hacer register', () => {
    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: '123456',
      password_rep: '123456',
    });
    component.register();
    expect(component.formSubmitted()).toBe(true);
  });

  it('no debería llamar a AuthRepository si el formulario es inválido', () => {
    component.RegisterForm.setValue({
      mail: '',
      username: '',
      password: '',
      password_rep: '',
    });
    component.register();
    expect(authRepoSpy.register).not.toHaveBeenCalled();
  });

  it('debería llamar a AuthRepository.register con el request si el formulario es válido', () => {
    authRepoSpy.register.mockReturnValue(of(ResponseStatus.SUCCESS));

    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: '123456',
      password_rep: '123456',
    });
    component.register();

    expect(authRepoSpy.register).toHaveBeenCalledWith({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: '123456',
    });
  });

  it('debería navegar a login y no mostrar error si el registro es SUCCESS', () => {
    authRepoSpy.register.mockReturnValue(of(ResponseStatus.SUCCESS));

    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: '123456',
      password_rep: '123456',
    });
    component.register();

    expect(router.navigate).toHaveBeenCalledWith(['']);
    expect(component.showError()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });

  it('debería mostrar error "Registration failed: Invalid credentials" si el status es INVALID_CREDENTIALS', () => {
    authRepoSpy.register.mockReturnValue(of(ResponseStatus.INVALID_CREDENTIALS));

    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: '123456',
      password_rep: '123456',
    });
    component.register();
    expect(component.showError()).toBe(true);
    expect(component.errorMessage()).toBe('Registration failed: Invalid credentials');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('debería mostrar error "Registration failed: Connection error" si el status es ERR_CONNECTION', () => {
    authRepoSpy.register.mockReturnValue(of(ResponseStatus.ERR_CONNECTION));

    component.RegisterForm.setValue({
      mail: 'sans@gmail.com',
      username: 'usuario',
      password: '123456',
      password_rep: '123456',
    });
    component.register();

    expect(component.showError()).toBe(true);
    expect(component.errorMessage()).toBe('Registration failed: Connection error');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});