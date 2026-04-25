import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Ranking } from './ranking';
import { RankingRepository } from '../../repository/ranking-repository';
import { FriendRespository } from '../../repository/friend-respository';
import { Remote } from '../../model/remote/remote';
import { UserRespository } from '../../repository/user-respository';
import { IconService } from '../../model/user/icon';

import { Websocket } from '../../model/remote/websocket';          // para lo nuevo del weboscket
import { GameState } from '../../model/remote/game-state'

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
      close: () => {}
    };

    const userRepoMock = {
      getOwnAccount: () => of({
        account_id: '1',
        username: 'test',
        avatar: 1
      }),
      getXpInfo: () => of({
        xp: 100,
        required_xp: 200
      })
    };

    const gameStateMock = {
      startingTime: { set: () => {} },
      increment: { set: () => {} },
      nombreRival: { set: () => {} }
    };

    const iconServiceMock = {
      getAvatarColor: () => 'blue'
    };
    
    await TestBed.configureTestingModule({
      imports: [Ranking],
      providers: [
        { provide: RankingRepository, useValue: rankingRepoMock },
        { provide: FriendRespository, useValue: friendRepoMock },
        { provide: Remote, useValue: remoteMock },
        { provide: UserRespository, useValue: userRepoMock },
        { provide: IconService, useValue: iconServiceMock },
        { provide: Websocket, useValue: websocketMock },
        { provide: GameState, useValue: gameStateMock } 
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ranking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
