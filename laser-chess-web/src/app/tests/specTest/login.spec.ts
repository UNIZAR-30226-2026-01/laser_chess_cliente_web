import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';  //simular el enrutador sin rutas reales
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Login } from '../../auth/login/login';
import { Remote } from '../../model/remote/remote';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let router: Router;

  //mock manual, objeto falso que reemplaza al servicio real (vv)
  let remoteSpy: {
    login: ReturnType<typeof vi.fn>;
    setTokens: ReturnType<typeof vi.fn>;
    getAccountIdFromToken: ReturnType<typeof vi.fn>;
    setAccountId: ReturnType<typeof vi.fn>;
  };


  //Configuración antes de cada prueba
  beforeEach(async () => {

    // los espías (funciones vacías que registran llamadas) (vv)
    remoteSpy = {
      login: vi.fn(),
      setTokens: vi.fn(),
      getAccountIdFromToken: vi.fn(),
      setAccountId: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: Remote, useValue: remoteSpy } //meter el mock
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
  it('debería poner formSubmitted a true al hacer login', () => {
    component.loginForm.setValue({
      credential: '',
      password: ''
    });

    component.login();

    expect(component.formSubmitted()).toBe(true);
  });

  it('no debería llamar a Remote si el formulario es inválido', () => {
    component.loginForm.setValue({
      credential: '',
      password: ''
    });

    component.login();

    expect(remoteSpy.login).not.toHaveBeenCalled();
  });

  it('debería llamar a Remote con el request si el formulario es válido', () => {
    remoteSpy.login.mockReturnValue(
      of({
        body: {
          access_token: 'fake-token'
        }
      } as any)
    );
    remoteSpy.getAccountIdFromToken.mockReturnValue(7);

    component.loginForm.setValue({
      credential: 'usuario',
      password: '123456'
    });
    component.login();
    expect(remoteSpy.login).toHaveBeenCalledWith({
      credential: 'usuario',
      password: '123456'
    });
  });

  it('debería guardar token, guardar accountId y navegar a home si el login va bien', () => {
    remoteSpy.login.mockReturnValue(
      of({
        body: {
          access_token: 'fake-token'
        }
      } as any)
    );
    remoteSpy.getAccountIdFromToken.mockReturnValue(7);

    component.loginForm.setValue({
      credential: 'usuario',
      password: '123456'
    });
    component.login();
    expect(remoteSpy.setTokens).toHaveBeenCalledWith('fake-token');
    expect(remoteSpy.getAccountIdFromToken).toHaveBeenCalled();
    expect(remoteSpy.setAccountId).toHaveBeenCalledWith(7);
    expect(router.navigate).toHaveBeenCalledWith(['home']);
    expect(component.showError()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });

  it('no debería llamar a setAccountId si getAccountIdFromToken devuelve null', () => {
    remoteSpy.login.mockReturnValue(
      of({
        body: {
          access_token: 'fake-token'
        }
      } as any)
    );
    remoteSpy.getAccountIdFromToken.mockReturnValue(null);

    component.loginForm.setValue({
      credential: 'usuario',
      password: '123456'
    });
    component.login();
    expect(remoteSpy.setTokens).toHaveBeenCalledWith('fake-token');
    expect(remoteSpy.getAccountIdFromToken).toHaveBeenCalled();
    expect(remoteSpy.setAccountId).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['home']);
  });

  it('debería mostrar error y resetear formulario si la respuesta viene sin body', () => {
    remoteSpy.login.mockReturnValue(
      of({ body: null } as any)
    );

    component.loginForm.setValue({
      credential: 'usuario',
      password: '123456'
    });
    component.login();
    expect(component.showError()).toBe(true);
    expect(component.errorMessage()).toBe('Login failed');
    expect(component.loginForm.get('credential')?.value).toBeNull();
    expect(component.loginForm.get('password')?.value).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('debería mostrar error y resetear formulario si Remote falla', () => {
    remoteSpy.login.mockReturnValue(
      throwError(() => new Error('401'))
    );

    component.loginForm.setValue({
      credential: 'usuario',
      password: '123456'
    });
    component.login();
    expect(component.showError()).toBe(true);
    expect(component.errorMessage()).toBe('Usuario/mail o contraseña incorrectos');
    expect(component.loginForm.get('credential')?.value).toBeNull();
    expect(component.loginForm.get('password')?.value).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});