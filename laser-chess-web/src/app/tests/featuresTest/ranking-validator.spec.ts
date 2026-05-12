// src/app/ranking/ranking.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Ranking } from '../../features/ranking/ranking';
import { RankingRepository, RankingPlayer, UserRankingInfo, EloType } from '../../repository/ranking-repository';
import { FriendRespository } from '../../repository/friend-respository';
import { Remote } from '../../model/remote/remote';
import { UserRespository } from '../../repository/user-respository';
import { FriendSummary } from '../../model/social/FriendSummary';
import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';
import { BoardState } from '../../utils/board-state';
import { ChallengeFlowService } from '../../services/challenge-flow';
import { TimerService } from '../../services/timer-service';
import { GameState } from '../../utils/game-state';
import { Websocket } from '../../model/remote/websocket';

const fakeSignal = (initial?: any) => {
  let value = initial;
  const fn: any = () => value;
  fn.set = vi.fn((v: any) => (value = v));
  return fn;
};

describe('Ranking', () => {
  let component: Ranking;
  let fixture: ComponentFixture<Ranking>;
  let rankingRepoSpy: {
    getTop100: ReturnType<typeof vi.fn>;
    getCurrentUserPosition: ReturnType<typeof vi.fn>;
  };
  let friendRepoSpy: {
    getFriends: ReturnType<typeof vi.fn>;
    getSentRequests: ReturnType<typeof vi.fn>;
    getAllRatings: ReturnType<typeof vi.fn>;
    addFriend: ReturnType<typeof vi.fn>;
    deleteFriend: ReturnType<typeof vi.fn>;
  };
  let remoteSpy: {
    getAccountId: ReturnType<typeof vi.fn>;
  };

  const mockTopPlayers: RankingPlayer[] = [
    { userId: 1, username: 'player1', elo: 2000 },
    { userId: 2, username: 'player2', elo: 1900 },
  ];
  const mockUserInfo: UserRankingInfo = { position: 50, elo: 1500 };
  const mockFriends: FriendSummary[] = [
    { account_id: 2, username: 'player2', level: 3, avatar: 1 },
  ];
  const mockSentRequests: FriendSummary[] = [
    { account_id: 3, username: 'player3', level: 1, avatar: 0 },
  ];
  const mockRatings: AllRatingsDTO = {
    userId: '2',
    blitz: 1200,
    rapid: 1300,
    classic: 1400,
    extended: 1500,
  };

  beforeEach(async () => {
    rankingRepoSpy = {
      getTop100: vi.fn().mockReturnValue(of(mockTopPlayers)),
      getCurrentUserPosition: vi.fn().mockReturnValue(of(mockUserInfo)),
    };

    friendRepoSpy = {
      getFriends: vi.fn().mockReturnValue(of(mockFriends)),
      getSentRequests: vi.fn().mockReturnValue(of(mockSentRequests)),
      getAllRatings: vi.fn().mockReturnValue(of(mockRatings)),
      addFriend: vi.fn().mockReturnValue(of(true)),
      deleteFriend: vi.fn().mockReturnValue(of(true)),
    };

    remoteSpy = {
      getAccountId: vi.fn().mockReturnValue(5),
    };

    await TestBed.configureTestingModule({
      imports: [Ranking],
      providers: [
        provideRouter([]),
        { provide: RankingRepository, useValue: rankingRepoSpy },
        { provide: FriendRespository, useValue: friendRepoSpy },
        { provide: Remote, useValue: remoteSpy },
        {
          provide: UserRespository,
          useValue: {
            getOwnAccount: vi.fn().mockReturnValue(of({
              userId: 1,
              username: 'test',
              level: 1,
              avatar: 0,
        piece_skin: 0,
            })),
            getXpInfo: vi.fn().mockReturnValue(of({ xp: 50, required_xp: 100 })),
            getXpInfoFriend: vi.fn().mockReturnValue(of({ xp: 50, required_xp: 100 })), 
            getAccount: vi.fn().mockReturnValue(of({
              userId: 1,
              username: 'test',
              level: 1,
              avatar: 0,
        piece_skin: 0,
            })),
            getId: vi.fn().mockReturnValue('1'),
            getUsername: vi.fn().mockReturnValue('test'),
          }
        },
        {
          provide: BoardState,
          useValue: { boardBackgroundUrl: fakeSignal(''), avatarUsuario: fakeSignal(0) }
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
          provide: TimerService,
          useValue: {
            miTiempo: fakeSignal(0),
            tiempoRival: fakeSignal(0),
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Ranking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ------------------------------------------------------------------
  // inicialización
  // ------------------------------------------------------------------
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar top 100, posición del usuario, amigos y solicitudes enviadas al iniciar', () => {
    expect(rankingRepoSpy.getTop100).toHaveBeenCalledWith('blitz');
    expect(rankingRepoSpy.getCurrentUserPosition).toHaveBeenCalledWith('blitz');
    expect(friendRepoSpy.getFriends).toHaveBeenCalled();
    expect(friendRepoSpy.getSentRequests).toHaveBeenCalled();
    expect(component.topPlayers()).toEqual(mockTopPlayers);
    expect(component.userInfo()).toEqual(mockUserInfo);
    expect(component.friends()).toEqual(mockFriends);
    expect(component.sentRequests()).toEqual(mockSentRequests);
    expect(component.loading()).toBe(false);
  });

  it('debería manejar error al cargar el top 100', () => {
    rankingRepoSpy.getTop100.mockReturnValue(throwError(() => new Error('Network error')));
    component.loadRanking();
    expect(component.error()).toBe('No se pudo cargar el ranking. Inténtalo más tarde.');
    expect(component.loading()).toBe(false);
    expect(component.topPlayers()).toEqual([]);
    expect(component.userInfo()).toBeNull();
  });

  it('debería manejar error al obtener la posición del usuario', () => {
    rankingRepoSpy.getCurrentUserPosition.mockReturnValue(throwError(() => new Error('Position error')));
    component.loadRanking();
    expect(component.error()).toBe('No se pudo obtener tu posición en el ranking. Inténtalo más tarde.');
    expect(component.loading()).toBe(false);
    expect(component.topPlayers()).toEqual(mockTopPlayers);
    expect(component.userInfo()).toBeNull();
  });

  // ------------------------------------------------------------------
  // tipo de ELO
  // ------------------------------------------------------------------
  it('debería cambiar el tipo de ELO y recargar el ranking', () => {
    const newType: EloType = 'rapid';
    component.onSelectEloType(newType);
    expect(component.selectedEloType()).toBe('rapid');
    expect(rankingRepoSpy.getTop100).toHaveBeenCalledWith('rapid');
    expect(rankingRepoSpy.getCurrentUserPosition).toHaveBeenCalledWith('rapid');
  });

  it('no debería recargar si se selecciona el mismo tipo de ELO', () => {
    const initialCalls = rankingRepoSpy.getTop100.mock.calls.length;
    component.onSelectEloType('blitz');
    expect(rankingRepoSpy.getTop100.mock.calls.length).toBe(initialCalls);
  });

  // ------------------------------------------------------------------
  // información de usuario
  // ------------------------------------------------------------------
  describe('openUserInfo', () => {
    it('debería abrir popup para el usuario actual (contexto self)', () => {
      const currentPlayer: RankingPlayer = { userId: 5, username: 'currentUser', elo: 1500 };
      component.openUserInfo(currentPlayer);
      expect(friendRepoSpy.getAllRatings).toHaveBeenCalledWith(5);
      expect(component.selectedUserContext()).toBe('self');
      expect(component.selectedUser()).not.toBeNull();
      expect(component.selectedUser()?.username).toBe('currentUser');
      expect(component.popUP_userInfo()).toBe(true);
      expect(component.selectedUserEloBlitz()).toBe(1200);
      expect(component.selectedUserEloRapid()).toBe(1300);
      expect(component.selectedUserEloClassic()).toBe(1400);
      expect(component.selectedUserEloExtended()).toBe(1500);
    });

    it('debería abrir popup para un amigo (contexto friend)', () => {
      const friendPlayer: RankingPlayer = { userId: 2, username: 'player2', elo: 1900 };
      component.openUserInfo(friendPlayer);
      expect(component.selectedUserContext()).toBe('friend');
      expect(component.popUP_userInfo()).toBe(true);
    });

    it('debería abrir popup para un usuario con solicitud enviada (contexto sent_request)', () => {
      const sentPlayer: RankingPlayer = { userId: 3, username: 'player3', elo: 1800 };
      component.openUserInfo(sentPlayer);
      expect(component.selectedUserContext()).toBe('sent_request');
    });

    it('debería abrir popup para un usuario sin relación (contexto none)', () => {
      const otherPlayer: RankingPlayer = { userId: 99, username: 'stranger', elo: 1600 };
      component.openUserInfo(otherPlayer);
      expect(component.selectedUserContext()).toBe('none');
    });

    it('debería manejar error al obtener los ELOs de otro usuario', () => {
      friendRepoSpy.getAllRatings.mockReturnValue(throwError(() => new Error('Ratings error')));
      const otherPlayer: RankingPlayer = { userId: 99, username: 'stranger', elo: 1600 };
      component.openUserInfo(otherPlayer);
      expect(component.selectedUserEloBlitz()).toBe(0);
      expect(component.selectedUserEloRapid()).toBe(0);
      expect(component.selectedUserEloClassic()).toBe(0);
      expect(component.selectedUserEloExtended()).toBe(0);
      expect(component.popUP_userInfo()).toBe(true);
    });
  });

  it('debería cerrar el popup de información de usuario', () => {
    component.popUP_userInfo.set(true);
    component.selectedUser.set({ username: 'test', account_id: 1, level: 0, avatar: 0 });
    component.closeUserInfo();
    expect(component.popUP_userInfo()).toBe(false);
    expect(component.selectedUser()).toBeNull();
  });

  // ------------------------------------------------------------------
  // solicitudes de amistad
  // ------------------------------------------------------------------
  it('debería enviar una solicitud de amistad y actualizar el contexto', () => {
    component.selectedUser.set({ username: 'stranger', account_id: 99, level: 0, avatar: 0 });
    component.selectedUserContext.set('none');
    component.sendFriendRequest();
    expect(friendRepoSpy.addFriend).toHaveBeenCalledWith({ receiver_username: 'stranger' });
    expect(friendRepoSpy.getSentRequests).toHaveBeenCalled();
    expect(component.selectedUserContext()).toBe('sent_request');
  });

  it('debería cancelar una solicitud de amistad enviada', () => {
    component.selectedUser.set({ username: 'player3', account_id: 3, level: 0, avatar: 0 });
    component.selectedUserContext.set('sent_request');
    component.cancelFriendRequest();
    expect(friendRepoSpy.deleteFriend).toHaveBeenCalledWith('player3');
    expect(friendRepoSpy.getSentRequests).toHaveBeenCalled();
    expect(component.selectedUserContext()).toBe('none');
  });

  it('debería eliminar un amigo', () => {
    component.selectedUser.set({ username: 'player2', account_id: 2, level: 0, avatar: 0 });
    component.selectedUserContext.set('friend');
    component.deleteFriend();
    expect(friendRepoSpy.deleteFriend).toHaveBeenCalledWith('player2');
    expect(friendRepoSpy.getFriends).toHaveBeenCalled();
    expect(component.selectedUserContext()).toBe('none');
    expect(component.popUP_userInfo()).toBe(false);
  });

  // ------------------------------------------------------------------
  // selectedUser nulo
  // ------------------------------------------------------------------
  it('no debería enviar solicitud si selectedUser es null', () => {
    component.selectedUser.set(null);
    component.sendFriendRequest();
    expect(friendRepoSpy.addFriend).not.toHaveBeenCalled();
  });

  it('no debería cancelar solicitud si selectedUser es null', () => {
    component.selectedUser.set(null);
    component.cancelFriendRequest();
    expect(friendRepoSpy.deleteFriend).not.toHaveBeenCalled();
  });

  it('no debería eliminar amigo si selectedUser es null', () => {
    component.selectedUser.set(null);
    component.deleteFriend();
    expect(friendRepoSpy.deleteFriend).not.toHaveBeenCalled();
  });
});