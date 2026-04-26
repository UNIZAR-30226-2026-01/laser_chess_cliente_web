import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Social } from '../../features/social/social';
import { FriendRespository } from '../../repository/friend-respository';
import { Websocket } from '../../model/remote/websocket';
import { UserRespository } from '../../repository/user-respository';
import { IconService } from '../../model/user/icon';
import { GameState } from '../../utils/game-state';
import { GameRepository } from '../../repository/game-repository';

import { MatIconTestingModule } from '@angular/material/icon/testing';
import { DomSanitizer } from '@angular/platform-browser';

describe('Social Angular', () => {
  let component: Social;
  let fixture: ComponentFixture<Social>;

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

    const startingTime = Object.assign(vi.fn(), { set: vi.fn() });
    const increment = Object.assign(vi.fn(), { set: vi.fn() });
    const nombreRival = Object.assign(vi.fn(), { set: vi.fn() });

    gameStateSpy = {
      startingTime,
      increment,
      nombreRival
    };

    gameRepoSpy = {
      getPausedGame: vi.fn().mockReturnValue(of([]))
    };

    iconServiceSpy = {
      getAvatarColor: vi.fn().mockReturnValue('blue')
    };

    await TestBed.configureTestingModule({
      imports: [
        Social,
        MatIconTestingModule   // 🔥 FIX REAL
      ],
      providers: [
        provideRouter([]),

        { provide: FriendRespository, useValue: friendRepoSpy },
        { provide: Websocket, useValue: websocketSpy },
        { provide: UserRespository, useValue: userRepoSpy },
        { provide: IconService, useValue: iconServiceSpy },
        { provide: GameState, useValue: gameStateSpy },
        { provide: GameRepository, useValue: gameRepoSpy },

        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (v: any) => v,
            bypassSecurityTrustResourceUrl: (v: any) => v
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