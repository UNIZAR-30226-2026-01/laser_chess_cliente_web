import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

import { History } from './history';
import { UserRespository } from '../../repository/user-respository';
import { TimerService } from '../../services/timer-service';
import { GameLogicService } from '../../services/game-logic-service';
import { HistoryService } from '../../services/history-service';
import { GameUtils } from '../../utils/game-utils';
import { Remote } from '../../model/remote/remote';
import { BoardState } from '../../utils/board-state';
import { GameState } from '../../utils/game-state';
import { Websocket } from '../../model/remote/websocket';
import { ChallengeFlowService } from '../../services/challenge-flow';
import { FriendRespository } from '../../repository/friend-respository';
import { RankingRepository } from '../../repository/ranking-repository';
import { signal } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const fakeSignal = (initial?: any) => {
  let value = initial;
  const fn: any = () => value;
  fn.set = (v: any) => { value = v; };
  return fn;
};

describe('History', () => {
  let component: History;
  let fixture: ComponentFixture<History>;

  beforeEach(async () => {

    const userRepoMock = {
      getOwnAccount: vi.fn().mockReturnValue(of({
        userId: 1,
        username: 'test',
        level: 1,
        avatar: 0,
        piece_skin: 0,
      })),
      getXpInfo: vi.fn().mockReturnValue(of({ xp: 100, required_xp: 200 })),
      getAccount: vi.fn().mockReturnValue(of({
        userId: 1,
        username: 'test',
        level: 1,
        avatar: 0,
      })),
      getId: vi.fn().mockReturnValue('1'),
      getUsername: vi.fn().mockReturnValue('testUser'),
      getXpInfoFriend: vi.fn().mockReturnValue(
        of({ xp: 100, required_xp: 200 })
      ),
    };

    const timerMock = {
      formatTime: vi.fn((t: number) => `${t}`),
      miTiempo: fakeSignal(0),
      tiempoRival: fakeSignal(0),
    };

    const gameLogicMock = {
      permitSalida: true
    };

    const historyMock = {
      listaPiezas: signal([]),
      laserPath: signal([]),
      miTiempo: signal(0),
      tiempoRival: signal(0),
      nombreRival: signal(''),
      miNombre: signal(''),
      miAvatar: signal(0),
      rivalAvatar: signal(0),
      inicializarTablero: vi.fn(),
      avanzar: vi.fn(),
      retroceder: vi.fn(),
      irAlPrimero: vi.fn(),
      irAlUltimo: vi.fn(),
      popUpLimites: signal(false),
      popUpMensaje: signal(''),
      historySelectedGame: fakeSignal(null),
      perfilRival: fakeSignal({
        userId: 0,
        username: '',
        mail: '',
        xp: 0,
        level: 0,
        avatar: 10,
        money: 0,
        board_skin: 0,
        piece_skin: 0,
        win_animation: 0,
        rankedPoints: 0
      }),
      perfilRivalSummary: signal(null),
      turnoVisual:signal(true),
    };

    const remoteMock = {
      getUsername: vi.fn().mockReturnValue('testUser'),
      getAccessToken: vi.fn(),
      isTokenExpired: vi.fn(),
      getAccountId: vi.fn().mockReturnValue('1'),
      autoLogin: vi.fn()
    };

    const gameUtilsMock = {
      isCasillaRestringida: vi.fn().mockReturnValue(false),
      importarTablero: vi.fn()
    };

    const friendRepoMock = {
      getFriends: vi.fn().mockReturnValue(of([])),
      getSentRequests: vi.fn().mockReturnValue(of([])),
      getAllRatings: vi.fn().mockReturnValue(of({ blitz: 0, rapid: 0, classic: 0, extended: 0 })),
      addFriend: vi.fn().mockReturnValue(of(true)),
      deleteFriend: vi.fn().mockReturnValue(of(true)),
    };

    const rankingRepoMock = {
      getTop100: vi.fn().mockReturnValue(of([])),
      getCurrentUserPosition: vi.fn().mockReturnValue(of({ position: 1, elo: 1200 })),
    };

    await TestBed.configureTestingModule({
      imports: [History],
      providers: [
        provideRouter([]),
        { provide: UserRespository, useValue: userRepoMock },
        { provide: TimerService, useValue: timerMock },
        { provide: GameLogicService, useValue: gameLogicMock },
        { provide: HistoryService, useValue: historyMock },
        { provide: GameUtils, useValue: gameUtilsMock },
        { provide: Remote, useValue: remoteMock },
        { provide: BoardState, useValue: { boardBackgroundUrl: fakeSignal(''), avatarUsuario: fakeSignal(0), refreshUser$: of(null)  } },
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
          provide: Websocket,
          useValue: {
            initConnection: vi.fn(),
            close: vi.fn(),
            connectionClosed$: of(null),
            connectionError$: of(null),
          }
        },
        {
          provide: ChallengeFlowService,
          useValue: {
            openChallengeConfig: vi.fn(),
            sendChallenge: vi.fn(),
            handleChallengeCancelled: vi.fn(),
            friendToChallenge: null,
            popUP_challengeConfig: fakeSignal(false),
            popUP_waiting: fakeSignal(false),
            selectedBoard: fakeSignal('Ace'),
            selectedMode: fakeSignal(null),
            selectedIncrement: fakeSignal(0),
            showConfigPopup: fakeSignal(false),
            customMinutes: fakeSignal(0),
            customIncrementSec: fakeSignal(0),
          }
        },
        { provide: FriendRespository, useValue: friendRepoMock },
        { provide: RankingRepository, useValue: rankingRepoMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(History);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});