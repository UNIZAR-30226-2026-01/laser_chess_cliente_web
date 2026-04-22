import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';  //simular el enrutador sin rutas reales
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Login } from '../../auth/login/login';
import { AuthRepository } from '../../repository/auth-repository';
import { ResponseStatus } from '../../model/auth/ResponseStatus';


import { NotificationService } from '../../model/notifications/notification';
import { Remote } from '../../model/remote/remote';


describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let router: Router;

  //mock manual, objeto falso que reemplaza al servicio real (vv)
  let authRepoSpy: {
   login: ReturnType<typeof vi.fn>;
  };


  //Configuración antes de cada prueba
  beforeEach(async () => {

    // los espías (funciones vacías que registran llamadas) (vv)
    authRepoSpy = {
     login: vi.fn(),
    };

    const notificationSpy = { setupAfterLogin: vi.fn() };
    const remoteSpy = { getAccountId: vi.fn().mockReturnValue('123') };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthRepository, useValue: authRepoSpy },//meter el mock
        { provide: NotificationService, useValue: notificationSpy },
        { provide: Remote, useValue: remoteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    vi.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  //Para limpiar despues de las pruebas
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });


  // ------------------------------------------------------------------
  // Test de los datos que se introducen
  // ------------------------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con credential y password', () => {
    expect(component.loginForm).toBeTruthy();
    expect(component.loginForm.get('credential')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('debería marcar inválido si credential está vacía', () => {
    component.loginForm.setValue({
      credential: '',
      password: '123456'
    });

    expect(component.loginForm.invalid).toBe(true);
  });

  it('debería marcar inválido si credential tiene formato incorrecto', () => {
    component.loginForm.setValue({
      credential: 'usuario invalido@@',
      password: '123456'
    });

    expect(component.loginForm.invalid).toBe(true);
  });

  it('debería marcar inválido si password está vacía', () => {
    component.loginForm.setValue({
      credential: 'usuario',
      password: ''
    });

    expect(component.loginForm.invalid).toBe(true);
  });

  it('debería marcar inválido si password tiene menos de 6 caracteres', () => {
    component.loginForm.setValue({
      credential: 'usuario',
      password: '123'
    });

    expect(component.loginForm.invalid).toBe(true);
  });

  it('debería marcar inválido si password tiene más de 50 caracteres', () => {
    const longPassword = 'a'.repeat(51);
    component.loginForm.setValue({
      credential: 'usuario',
      password: longPassword
    });

    expect(component.loginForm.invalid).toBe(true);
    expect(component.loginForm.get('password')?.hasError('maxlength')).toBe(true);
  });

  it('debería marcar válido con username y password correctos', () => {
    component.loginForm.setValue({
      credential: 'usuario',
      password: '123456'
    });

    expect(component.loginForm.valid).toBe(true);
  });

  it('debería marcar válido con email y password correctos', () => {
    component.loginForm.setValue({
      credential: 'mail@test.com',
      password: '123456'
    });

    expect(component.loginForm.valid).toBe(true);
  });



  // ------------------------------------------------------------------
  // Test del login
  // ------------------------------------------------------------------
  it('debería llamar a AuthRepository con el request si el formulario es válido', () => {
    authRepoSpy.login.mockReturnValue(of(ResponseStatus.SUCCESS));

    component.loginForm.setValue({
      credential: 'usuario',
      password: '123456'
    });
    component.login();

    expect(authRepoSpy.login).toHaveBeenCalledWith({
      credential: 'usuario',
      password: '123456'
    });
  });

  it('debería navegar a home y limpiar errores si el login es SUCCESS', () => {
    authRepoSpy.login.mockReturnValue(of(ResponseStatus.SUCCESS));

    component.loginForm.setValue({
      credential: 'usuario',
      password: '123456'
    });
    component.login();

    expect(router.navigate).toHaveBeenCalledWith(['home']);
    expect(component.showError()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });

  it('debería mostrar error "Login failed: Invalid credentials" y resetear formulario si el status es INVALID_CREDENTIALS', () => {
    authRepoSpy.login.mockReturnValue(of(ResponseStatus.INVALID_CREDENTIALS));

    component.loginForm.setValue({
      credential: 'usuario',
      password: '123456'
    });
    component.login();

    expect(component.showError()).toBe(true);
    expect(component.errorMessage()).toBe('Login failed: Invalid credentials');
    expect(component.loginForm.get('credential')?.value).toBeNull();
    expect(component.loginForm.get('password')?.value).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('debería mostrar error "Login failed: Connection error" y resetear formulario si el status es ERR_CONNECTION', () => {
    authRepoSpy.login.mockReturnValue(of(ResponseStatus.ERR_CONNECTION));

    component.loginForm.setValue({
      credential: 'usuario',
      password: '123456'
    });
    component.login();

    expect(component.showError()).toBe(true);
    expect(component.errorMessage()).toBe('Login failed: Connection error');
    expect(component.loginForm.get('credential')?.value).toBeNull();
    expect(component.loginForm.get('password')?.value).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

});