import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Social } from '../../features/social/social';
import { FriendRespository } from '../../repository/friend-respository';
import { UserRespository } from '../../repository/user-respository';
import { GameRepository } from '../../repository/game-repository';

import { MatIconTestingModule } from '@angular/material/icon/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { NotificationService } from '../../model/notifications/notification';
import { ChallengeFlowService } from '../../services/challenge-flow';
import { GameState } from '../../utils/game-state';
import { BoardState } from '../../utils/board-state';
import { TimerService } from '../../services/timer-service';
import { Websocket } from '../../model/remote/websocket';

const fakeSignal = (initial?: any) => {
  let value = initial;
  const fn: any = () => value;
  fn.set = vi.fn((v: any) => (value = v));
  return fn;
};

describe('Social Angular', () => {
  let component: Social;
  let fixture: ComponentFixture<Social>;

  let friendRepoSpy: any;
  let userRepoSpy: any;
  let iconServiceSpy: any;
  let gameRepoSpy: any;
  let challengeFlowSpy: any;

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
        userId: 1,
        username: 'test',
        level: 1,
        avatar: 0,
        piece_skin: 0,
      })),
      getXpInfo: vi.fn().mockReturnValue(of({
        xp: 50,
        required_xp: 100
      })),
      getAccount: vi.fn().mockReturnValue(of({
        userId: 1,
        username: 'test',
        level: 1,
        avatar: 0,
        piece_skin: 0,
      })),
      getUsername: vi.fn().mockReturnValue('testUser'),
      getId: vi.fn().mockReturnValue('123'),
      getXpInfoFriend: vi.fn().mockReturnValue(
        of({ xp: 100, required_xp: 200 })
      ),
    };

    gameRepoSpy = {
      getPausedGame: vi.fn().mockReturnValue(of([]))
    };

    iconServiceSpy = {
      getAvatarColor: vi.fn().mockReturnValue('blue')
    };

    challengeFlowSpy = {
      friendToChallenge: null,
      openChallengeConfig: vi.fn(),
      sendChallenge: vi.fn(),
      handleChallengeCancelled: vi.fn(),
      popUP_challengeConfig: fakeSignal(false),
      popUP_waiting: fakeSignal(false),
      selectedBoard: fakeSignal('Ace'),
      selectedMode: fakeSignal(null),
      selectedIncrement: fakeSignal(0),
      customMinutes: fakeSignal(5),
      customIncrementSec: fakeSignal(0),
      showConfigPopup: fakeSignal(false),
      boards: [],
      timeModes: [],
    };

    await TestBed.configureTestingModule({
      imports: [
        Social,
        MatIconTestingModule
      ],
      providers: [
        provideRouter([]),

        { provide: FriendRespository, useValue: friendRepoSpy },
        { provide: ChallengeFlowService, useValue: challengeFlowSpy },
        { provide: UserRespository, useValue: userRepoSpy },
        { provide: GameRepository, useValue: gameRepoSpy },

        {
          provide: GameState,
          useValue: {
            startingTime: fakeSignal(0),
            increment: fakeSignal(0),
            nombreRival: fakeSignal(''),
            miNombre: fakeSignal(''),
          }
        },
        {
          provide: BoardState,
          useValue: { boardBackgroundUrl: fakeSignal(''), avatarUsuario: fakeSignal(0), refreshUser$: of(null)  }
        },
        {
          provide: Websocket,
          useValue: {
            initConnection: vi.fn(),
            close: vi.fn(),
            connectionClosed$: of(null),
            connectionError$: of(null),
          }
        },
        {
          provide: TimerService,
          useValue: {
            miTiempo: fakeSignal(0),
            tiempoRival: fakeSignal(0),
          }
        },
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (v: any) => v,
            bypassSecurityTrustResourceUrl: (v: any) => v
          }
        },
        {
          provide: NotificationService,
          useValue: {
            wakeSocial$: of(null),
            showWebNotification: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Social);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => vi.restoreAllMocks());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});