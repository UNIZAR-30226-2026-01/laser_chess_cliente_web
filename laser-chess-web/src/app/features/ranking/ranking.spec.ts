import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Ranking } from './ranking';
import { RankingRepository } from '../../repository/ranking-repository';
import { FriendRespository } from '../../repository/friend-respository';
import { Remote } from '../../model/remote/remote';
import { UserRespository } from '../../repository/user-respository';

import { Websocket } from '../../model/remote/websocket';
import { GameState } from '../../utils/game-state';
import { BoardState } from '../../utils/board-state';
import { ChallengeFlowService } from '../../services/challenge-flow';
import { TimerService } from '../../services/timer-service';

const fakeSignal = (initial?: any) => {
  let value = initial;
  const fn: any = () => value;
  fn.set = (v: any) => { value = v; };
  return fn;
};

describe('Ranking', () => {
  let component: Ranking;
  let fixture: ComponentFixture<Ranking>;

  beforeEach(async () => {
    
    const rankingRepoMock = {
      getTop100: () => of([]),
      getCurrentUserPosition: () => of({ position: 1, elo: 1200 })
    };

    const friendRepoMock = {
      getFriends: () => of([]),
      getSentRequests: () => of([]),
      getAllRatings: () => of({
        blitz: 1200,
        rapid: 1300,
        classic: 1400,
        extended: 1500
      }),
      addFriend: () => of(true),
      deleteFriend: () => of(true)
    };

    const remoteMock = {
      getAccountId: () => '1',
      getUsername: () => 'testuser'
    };

    const websocketMock = {
      initConnection: () => {},
      close: () => {},
      connectionClosed$: of(null),
      connectionError$: of(null),
    };

    const userRepoMock = {
      getOwnAccount: () => of({
        userId: 1,
        username: 'test',
        level: 1,
        avatar: 0,
        piece_skin: 0,
      }),
      getXpInfo: () => of({
        xp: 100,
        required_xp: 200
      }),
      getAccount: () => of({
        userId: 1,
        username: 'test',
        level: 1,
        avatar: 0,
        piece_skin: 0,
      }),
      getId: () => '1',
      getUsername: () => 'test',
      getXpInfoFriend: vi.fn().mockReturnValue(
        of({ xp: 100, required_xp: 200 })
      ),
    };

    const gameStateMock = {
      startingTime: fakeSignal(0),
      increment: fakeSignal(0),
      nombreRival: fakeSignal(''),
      miNombre: fakeSignal(''),
    };

    const iconServiceMock = {
      getAvatarColor: () => 'blue'
    };

    const challengeFlowMock = {
      friendToChallenge: null,
      openChallengeConfig: () => {},
      sendChallenge: () => {},
      handleChallengeCancelled: () => {},
      popUP_challengeConfig: fakeSignal(false),
      popUP_waiting: fakeSignal(false),
      selectedBoard: fakeSignal('Ace'),
      selectedMode: fakeSignal(null),
      selectedIncrement: fakeSignal(0),
      showConfigPopup: fakeSignal(false),
      customMinutes: fakeSignal(0),
      customIncrementSec: fakeSignal(0),
    };

    const timerServiceMock = {
      miTiempo: fakeSignal(0),
      tiempoRival: fakeSignal(0),
    };
    
    await TestBed.configureTestingModule({
      imports: [Ranking],
      providers: [
        { provide: RankingRepository, useValue: rankingRepoMock },
        { provide: FriendRespository, useValue: friendRepoMock },
        { provide: Remote, useValue: remoteMock },
        { provide: UserRespository, useValue: userRepoMock },
        { provide: Websocket, useValue: websocketMock },
        { provide: GameState, useValue: gameStateMock },
        { provide: BoardState, useValue: { boardBackgroundUrl: fakeSignal(''), avatarUsuario: fakeSignal(0) } },
        { provide: ChallengeFlowService, useValue: challengeFlowMock },
        { provide: TimerService, useValue: timerServiceMock },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ranking);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});