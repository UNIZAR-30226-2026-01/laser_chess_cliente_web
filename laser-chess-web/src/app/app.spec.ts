import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Remote } from './model/remote/remote';
import { NotificationService } from './model/notifications/notification';
import { AuthRepository } from './repository/auth-repository';

// Pruebas automáticas para verificar que la app funciona correctamente
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: Remote, useValue: {} },
        { provide: NotificationService, useValue: {} },
        { provide: AuthRepository, useValue: {} }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
  
});
