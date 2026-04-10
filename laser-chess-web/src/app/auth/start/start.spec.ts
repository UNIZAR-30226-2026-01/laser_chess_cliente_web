import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { Start } from './start';
import { Remote } from '../../model/remote/remote';

describe('Start', () => {
  let component: Start;
  let fixture: ComponentFixture<Start>;
  let router: Router;

  let remoteSpy: {
    getAccessToken: ReturnType<typeof vi.fn>;
    isTokenExpired: ReturnType<typeof vi.fn>;
    autoLogin: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    remoteSpy = {
      getAccessToken: vi.fn(),
      isTokenExpired: vi.fn(),
      autoLogin: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Start],
      providers: [
        provideRouter([]),
        { provide: Remote, useValue: remoteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Start);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    remoteSpy.getAccessToken.mockReturnValue(null);
    remoteSpy.autoLogin.mockReturnValue(of(false));

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('debería navegar a /home si hay token válido', () => {
    remoteSpy.getAccessToken.mockReturnValue('token-valido');
    remoteSpy.isTokenExpired.mockReturnValue(false);

    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(remoteSpy.autoLogin).not.toHaveBeenCalled();
  });

  it('debería intentar autoLogin si no hay token', () => {
    remoteSpy.getAccessToken.mockReturnValue(null);
    remoteSpy.autoLogin.mockReturnValue(of(false));

    fixture.detectChanges();

    expect(remoteSpy.autoLogin).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalledWith(['/home']);
  });

  it('debería navegar a /home si autoLogin devuelve authenticated = true', () => {
    remoteSpy.getAccessToken.mockReturnValue(null);
    remoteSpy.autoLogin.mockReturnValue(of(true));

    fixture.detectChanges();

    expect(remoteSpy.autoLogin).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('no debería navegar a /home si el token está expirado y autoLogin devuelve false', () => {
    remoteSpy.getAccessToken.mockReturnValue('token-expirado');
    remoteSpy.isTokenExpired.mockReturnValue(true);
    remoteSpy.autoLogin.mockReturnValue(of(false));

    fixture.detectChanges();

    expect(remoteSpy.autoLogin).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalledWith(['/home']);
  });
});