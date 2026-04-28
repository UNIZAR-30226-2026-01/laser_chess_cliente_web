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
    
  });
  // ------------------------------------------------------------------
  // Tests de añadir amigo
  // ------------------------------------------------------------------
  it('debería mostrar error si el nombre de usuario está vacío al añadir amigo', () => {
    component.newFriendUsername.set('');
    component.addFriend();
    expect(component.errorAmigoNombreNoValido()).toBe(true);
    expect(friendRepoSpy.addFriend).not.toHaveBeenCalled();
  });

  it('debería llamar a addFriend con el nombre correcto y cerrar popup si éxito', async () => {
    component.newFriendUsername.set('nuevo_usuario');
    component.popUP_newFriend.set(true);
    component.addFriend();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(friendRepoSpy.addFriend).toHaveBeenCalledWith({ receiver_username: 'nuevo_usuario' });
    expect(component.popUP_newFriend()).toBe(false);
    expect(component.errorAmigoNombreNoValido()).toBe(false);
  });

  it('no debería cerrar popup si addFriend falla', () => {
    friendRepoSpy.addFriend.mockReturnValue(of(false));
    component.newFriendUsername.set('nuevo_usuario');
    component.popUP_newFriend.set(true);
    component.addFriend();
    expect(component.popUP_newFriend()).toBe(true); // sigue abierto, sirve para cualquier fallo tipo si no existe el user y esas cosas
  });

  // ------------------------------------------------------------------
  // Tests de eliminar amigo
  // ------------------------------------------------------------------
  it('debería llamar a deleteFriend y recargar amigos si éxito', () => {
    component.deleteFriend('amigo1');

    expect(friendRepoSpy.deleteFriend).toHaveBeenCalledWith('amigo1');
    expect(friendRepoSpy.getFriends).toHaveBeenCalledTimes(2); // porque dentro de deleteFriend se llama loadFriends()
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
  it('debería llamar a deleteFriend al cancelar solicitud enviada', () => {
    component.cancelSentRequest('destinatario');
    expect(friendRepoSpy.deleteFriend).toHaveBeenCalledWith('destinatario');
    // comprobar que se elimina de la lista
    component.sentRequests.set([{ account_id: 1, username: 'destinatario', level: 1, avatar: 0 }]);
    component.cancelSentRequest('destinatario');
    fixture.detectChanges();

    expect(component.sentRequests().length).toBe(0);
  });

  // ------------------------------------------------------------------
  // Tests de obtener ELO en la informacion de usuario
  // ------------------------------------------------------------------
  it('debería obtener ratings al abrir información de un amigo', async () => {
    const user: any = { account_id: '123', username: 'test', level: 5, avatar: 1 };
    component.openUserInfo(user, 'friend');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(friendRepoSpy.getAllRatings).toHaveBeenCalledWith(123);
    expect(component.selectedUserEloBlitz()).toBe(1200);
    expect(component.selectedUserEloRapid()).toBe(1300);
  });

  // ------------------------------------------------------------------
  // Tests de desafiar a un amigo con el websocket
  // ------------------------------------------------------------------
  it('debería iniciar conexión WebSocket al enviar desafío', () => {
    const friend = { account_id: 1, username: 'rival', level: 2, avatar: 0 };
    component.openChallengeConfig(friend);
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