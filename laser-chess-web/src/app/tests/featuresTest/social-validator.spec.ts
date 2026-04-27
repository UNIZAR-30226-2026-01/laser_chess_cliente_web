import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Social } from '../../features/social/social';
import { FriendRespository } from '../../repository/friend-respository';
import { Websocket } from '../../model/remote/websocket';
import { UserRespository } from '../../repository/user-respository';
import { IconService } from '../../model/user/icon';
import { GameState } from '../../utils/game-state';
import { GameRepository } from '../../repository/game-repository';
import { TimerService } from '../../services/timer-service';
import { NotificationService } from '../../model/notifications/notification';

/* ---------------------------
   helper para simular signals
---------------------------- */
const fakeSignal = (initial?: any) => {
  let value = initial;
  const fn: any = () => value;
  fn.set = vi.fn((v: any) => (value = v));
  return fn;
};

describe('Social Validator', () => {
  let component: Social;
  let fixture: ComponentFixture<Social>;
  let router: Router;

  let friendRepoSpy: any;
  let websocketSpy: any;
  let userRepoSpy: any;
  let iconServiceSpy: any;
  let gameStateSpy: any;
  let gameRepoSpy: any;

  beforeEach(async () => {
    friendRepoSpy = {
      getFriends: vi.fn().mockReturnValue(of([])),
      getRequestFriends: vi.fn().mockReturnValue(of([])),
      getSentRequests: vi.fn().mockReturnValue(of([])),
      addFriend: vi.fn().mockReturnValue(of(true)),
      deleteFriend: vi.fn().mockReturnValue(of(true)),
      acceptRequest: vi.fn().mockReturnValue(of(true)),
      getAllRatings: vi.fn().mockReturnValue(of({
        blitz: 1200,
        rapid: 1300,
        classic: 1400,
        extended: 1500
      }))
    };

    userRepoSpy = {
      getOwnAccount: vi.fn().mockReturnValue(of({
        account_id: '1',
        username: 'test',
        level: 1,
        avatar: 0
      })),
      getXpInfo: vi.fn().mockReturnValue(of({
        xp: 50,
        required_xp: 100
      })),
      getUsername: vi.fn().mockReturnValue('testUser'),
      getId: vi.fn().mockReturnValue('123')
    };

    websocketSpy = {
      initConnection: vi.fn(),
      close: vi.fn()
    };

    gameStateSpy = {
      startingTime: fakeSignal(),
      increment: fakeSignal(),
      nombreRival: fakeSignal(),
      miNombre: fakeSignal()
    };

    gameRepoSpy = {
      getPausedGame: vi.fn().mockReturnValue(of([]))
    };

    iconServiceSpy = {
      getAvatarColor: vi.fn().mockReturnValue('blue')
    };

    await TestBed.configureTestingModule({
      imports: [Social],
      providers: [
        provideRouter([]),

        { provide: FriendRespository, useValue: friendRepoSpy },
        { provide: Websocket, useValue: websocketSpy },
        { provide: UserRespository, useValue: userRepoSpy },
        { provide: IconService, useValue: iconServiceSpy },
        { provide: GameState, useValue: gameStateSpy },
        { provide: GameRepository, useValue: gameRepoSpy },

        
        {
          provide: TimerService,
          useValue: {
            miTiempo: { set: vi.fn() },
            tiempoRival: { set: vi.fn() }
          }
        },
        {
        provide: NotificationService,
        useValue: {
          wakeSocial$: of(null),
        }
      }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Social);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => vi.restoreAllMocks());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería iniciar WebSocket al enviar desafío', () => {
    const friend = {
      account_id: '1',
      username: 'rival',
      level: 2,
      avatar: 0
    } as any;

    component.friendToChallenge = friend;

    component.selectedBoard.set(2);
    component.selectedMode.set({
      id: 'blitz',
      baseSeconds: 300,
      increments: [0, 2, 5]
    });
    component.selectedIncrement.set(2);

    component.sendChallenge(null);

    expect(websocketSpy.initConnection).toHaveBeenCalledWith(
      'challenge',
      expect.objectContaining({
        username: 'rival',
        board: 2,
        starting_time: 300,
        time_increment: 2
      })
    );

    expect(component.popUP_waiting()).toBe(true);
  });

  it('debería cerrar WebSocket al cancelar espera', () => {
    component.cancelWaiting();

    expect(websocketSpy.close).toHaveBeenCalled();
    expect(component.popUP_waiting()).toBe(false);
  });
});