import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { AuthRepository } from '../../repository/auth-repository';
import { NotificationService } from '../../model/notifications/notification';
import { Remote } from '../../model/remote/remote';
import { provideRouter } from '@angular/router'; 

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    const authRepoMock = {} as AuthRepository;
    const notificationMock = {} as NotificationService;
    const remoteMock = {} as Remote;

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),  
        { provide: AuthRepository, useValue: authRepoMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: Remote, useValue: remoteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
