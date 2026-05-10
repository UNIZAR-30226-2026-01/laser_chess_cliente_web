import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Social } from '../../features/social/social';
import { FriendRespository } from '../../repository/friend-respository';
import { ChallengeFlowService } from '../../services/challenge-flow';
import { UserRespository } from '../../repository/user-respository';
import { GameState } from '../../utils/game-state';
import { GameRepository } from '../../repository/game-repository';
import { TimerService } from '../../services/timer-service';
import { NotificationService } from '../../model/notifications/notification';
import { BoardState } from '../../utils/board-state';
import { Websocket } from '../../model/remote/websocket';

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
  let userRepoSpy: any;
  let gameRepoSpy: any;
  let challengeFlowSpy: any;
  let websocketSpy: any;

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
      getXpInfo: vi.fn().mockReturnValue(of({ xp: 50, required_xp: 100 })),
      getUsername: vi.fn().mockReturnValue('testUser'),
      getId: vi.fn().mockReturnValue('123'),
      getAccount: vi.fn().mockReturnValue(of({ username: 'rival', userId: 1, level: 1, avatar: 0, piece_skin: 0 }))
    };

    gameRepoSpy = {
      getPausedGame: vi.fn().mockReturnValue(of([]))
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
      showConfigPopup: fakeSignal(false),
      customMinutes: fakeSignal(0),
      customIncrementSec: fakeSignal(0),
    };

    websocketSpy = {
      initConnection: vi.fn(),
      close: vi.fn(),
      connectionClosed$: of(null),
      connectionError$: of(null),
    };

    await TestBed.configureTestingModule({
      imports: [Social],
      providers: [
        provideRouter([]),
        { provide: FriendRespository, useValue: friendRepoSpy },
        { provide: ChallengeFlowService, useValue: challengeFlowSpy },
        { provide: UserRespository, useValue: userRepoSpy },
        {
          provide: GameState,
          useValue: {
            startingTime: fakeSignal(0),
            increment: fakeSignal(0),
            nombreRival: fakeSignal(''),
            miNombre: fakeSignal(''),
          }
        },
        { provide: GameRepository, useValue: gameRepoSpy },
        {
          provide: BoardState,
          useValue: { boardBackgroundUrl: fakeSignal(''), avatarUsuario: fakeSignal(0) }
        },
        { provide: Websocket, useValue: websocketSpy },
        {
          provide: TimerService,
          useValue: {
            miTiempo: fakeSignal(0),
            tiempoRival: fakeSignal(0),
          }
        },
        {
          provide: NotificationService,
          useValue: { wakeSocial$: of(null), showWebNotification: vi.fn()
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

  // ------------------------------------------------------------------
  // Tests de añadir amigo
  // ------------------------------------------------------------------
  it('debería mostrar error si el nombre de usuario está vacío al añadir amigo', () => {
    component.addFriendFromPopup('');
    expect(component.errorAmigoNombreNoValido()).toBe(true);
    expect(friendRepoSpy.addFriend).not.toHaveBeenCalled();
  });

  it('debería mostrar error si el nombre es solo espacios', () => {
    component.addFriendFromPopup('   ');
    expect(component.errorAmigoNombreNoValido()).toBe(true);
    expect(friendRepoSpy.addFriend).not.toHaveBeenCalled();
  });

  it('debería llamar a addFriend con el nombre correcto y cerrar popup si éxito', async () => {
    component.popUP_newFriend.set(true);
    component.addFriendFromPopup('nuevo_usuario');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(friendRepoSpy.addFriend).toHaveBeenCalledWith({ receiver_username: 'nuevo_usuario' });
    expect(component.popUP_newFriend()).toBe(false);
    expect(component.errorAmigoNombreNoValido()).toBe(false);
  });

  it('no debería cerrar popup si addFriend devuelve false', () => {
    friendRepoSpy.addFriend.mockReturnValue(of(false));
    component.popUP_newFriend.set(true);
    component.addFriendFromPopup('nuevo_usuario');
    expect(component.popUP_newFriend()).toBe(true);
  });

  // ------------------------------------------------------------------
  // Tests de eliminar amigo
  // ------------------------------------------------------------------
  it('debería llamar a deleteFriend y recargar estado social si éxito', () => {
    component.deleteFriend('amigo1');
    expect(friendRepoSpy.deleteFriend).toHaveBeenCalledWith('amigo1');
    expect(friendRepoSpy.getFriends).toHaveBeenCalled();
  });

  it('no debería llamar a deleteFriend si el username está vacío', () => {
    const callsBefore = friendRepoSpy.deleteFriend.mock.calls.length;
    component.deleteFriend('');
    expect(friendRepoSpy.deleteFriend.mock.calls.length).toBe(callsBefore);
  });

  // ------------------------------------------------------------------
  // Tests de aceptar solicitud
  // ------------------------------------------------------------------
  it('debería llamar a acceptRequest y recargar amigos y solicitudes', () => {
    component.acceptRequest('solicitante');
    expect(friendRepoSpy.acceptRequest).toHaveBeenCalledWith('solicitante');
    expect(friendRepoSpy.getFriends).toHaveBeenCalled();
    expect(friendRepoSpy.getRequestFriends).toHaveBeenCalled();
  });

  it('no debería llamar a acceptRequest si el username está vacío', () => {
    component.acceptRequest('');
    expect(friendRepoSpy.acceptRequest).not.toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  // Tests de rechazar solicitud
  // ------------------------------------------------------------------
  it('debería llamar a deleteFriend al rechazar y actualizar listas', () => {
    component.rejectRequest('solicitante');
    expect(friendRepoSpy.deleteFriend).toHaveBeenCalledWith('solicitante');
    expect(friendRepoSpy.getRequestFriends).toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  // Tests de cancelar solicitud enviada
  // ------------------------------------------------------------------
  it('debería llamar a deleteFriend al cancelar solicitud enviada y eliminarla de la lista', () => {
    component.sentRequests.set([{ account_id: 1, username: 'destinatario', level: 1, avatar: 0 }]);
    component.cancelSentRequest('destinatario');

    expect(friendRepoSpy.deleteFriend).toHaveBeenCalledWith('destinatario');
    fixture.detectChanges();
    expect(component.sentRequests().find(r => r.username === 'destinatario')).toBeUndefined();
  });

  // ------------------------------------------------------------------
  // Tests de popup userInfo
  // ------------------------------------------------------------------
  it('debería abrir popup y obtener ratings al llamar a openUserInfo', async () => {
    const user: any = { account_id: '123', username: 'test', level: 5, avatar: 1 };
    component.openUserInfo(user, 'friend');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.popUP_userInfo()).toBe(true);
    expect(component.selectedUser()).toEqual(user);
    expect(component.selectedUserContext()).toBe('friend');
    expect(friendRepoSpy.getAllRatings).toHaveBeenCalledWith(123);
    expect(component.selectedUserEloBlitz()).toBe(1200);
    expect(component.selectedUserEloRapid()).toBe(1300);
    expect(component.selectedUserEloClassic()).toBe(1400);
    expect(component.selectedUserEloExtended()).toBe(1500);
  });

  it('debería cerrar popup y limpiar usuario al llamar a closeUserInfo', () => {
    component.popUP_userInfo.set(true);
    component.selectedUser.set({ account_id: 1, username: 'test', level: 1, avatar: 0 });
    component.closeUserInfo();
    expect(component.popUP_userInfo()).toBe(false);
    expect(component.selectedUser()).toBeNull();
  });

  // ------------------------------------------------------------------
  // Tests de desafío — delegación a ChallengeFlowService
  // ------------------------------------------------------------------
  it('debería delegar openChallengeConfig al flow al retar desde popup', () => {
    const friend: any = { account_id: 1, username: 'rival', level: 2, avatar: 0 };
    component.selectedUser.set(friend);
    component.popUP_userInfo.set(true);

    component.challengeFromPopup();

    expect(challengeFlowSpy.openChallengeConfig).toHaveBeenCalledWith(friend);
    expect(component.popUP_userInfo()).toBe(false);
  });

  it('no debería delegar challenge si no hay usuario seleccionado', () => {
    component.selectedUser.set(null);
    component.challengeFromPopup();
    expect(challengeFlowSpy.openChallengeConfig).not.toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  // Tests de popup de solicitudes
  // ------------------------------------------------------------------
  it('debería abrir popup de solicitudes y cargar datos', () => {
    const callsBefore = friendRepoSpy.getRequestFriends.mock.calls.length;
    component.openRequestPopup();
    expect(friendRepoSpy.getRequestFriends.mock.calls.length).toBeGreaterThan(callsBefore);
    expect(component.popUP_request()).toBe(true);
    expect(component.requestTabState()).toBe('received');
  });

  it('debería cambiar la pestaña de solicitudes', () => {
    component.setRequestTab('sent');
    expect(component.requestTabState()).toBe('sent');
    component.setRequestTab('received');
    expect(component.requestTabState()).toBe('received');
  });
});