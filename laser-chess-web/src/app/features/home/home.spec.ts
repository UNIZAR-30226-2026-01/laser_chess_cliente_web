import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UserRespository } from '../../repository/user-respository';
import { IconService } from '../../model/user/icon';

import { Home } from './home';
import { NotificationService } from '../../model/notifications/notification';
import { GameState } from '../../utils/game-state';
import { TimerService } from '../../services/timer-service';
import { Websocket } from '../../model/remote/websocket';
import { Remote } from '../../model/remote/remote';
import { FriendRespository } from '../../repository/friend-respository';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    
    const userRepoMock = {
      getOwnAccount: () => of({
        account_id: '1',
        username: 'testUser',
        level: 1,
        avatar: 0
      }),
      getXpInfo: () => of({
        xp: 50,
        required_xp: 100
      }),
      getUsername: () => 'testUser',
      getAccountId: () => '1',
      getId: () => '1', 
      getPieceSkin: () => '0'
    };

    const iconServiceMock = {
      getAvatarColor: () => 'blue'
    };
    
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
            params: of({}),
            queryParams: of({})
          }
        },
        { provide: UserRespository, useValue: userRepoMock },
        { provide: IconService, useValue: iconServiceMock },
        {
          provide: NotificationService,
          useValue: {
            wakeHome$: of(null)
          }
        },
        {
          provide: Websocket,
          useValue: {
            initConnection: vi.fn(),
            checkAndReconnect: vi.fn()
          }
        },
        {
          provide: Remote,
          useValue: { 
            getAccountId: () => '1',
            checkSolicitudes: vi.fn().mockReturnValue(of([]))
          }
        },
        {
          provide: TimerService,
          useValue: {
            miTiempo: { set: vi.fn() },
            tiempoRival: { set: vi.fn() }
          }
        },
        {
          provide: GameState,
          useValue: {
            miNombre: { set: vi.fn(), get: vi.fn() },
            nombreRival: { set: vi.fn(), get: vi.fn() }
          }
        },
        { provide: FriendRespository, useValue: {getFriends: vi.fn().mockReturnValue(of([]))}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
