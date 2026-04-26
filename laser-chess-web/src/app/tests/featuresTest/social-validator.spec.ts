import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Social } from '../../features/social/social';
import { FriendRespository } from '../../repository/friend-respository';
import { Websocket } from '../../model/remote/websocket';
import { FriendSummary } from '../../model/social/FriendSummary';
import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';

import { UserRespository } from '../../repository/user-respository';
import { IconService } from '../../model/user/icon';
import { GameRepository } from '../../repository/game-repository';
import { GameState } from '../../utils/game-state';

describe('Social', () => {
  let component: Social;
  let fixture: ComponentFixture<Social>;
  let router: Router;
  let friendRepoSpy: {
    getFriends: ReturnType<typeof vi.fn>;
    getRequestFriends: ReturnType<typeof vi.fn>;
    getSentRequests: ReturnType<typeof vi.fn>;
    addFriend: ReturnType<typeof vi.fn>;
    deleteFriend: ReturnType<typeof vi.fn>;
    acceptRequest: ReturnType<typeof vi.fn>;
    getAllRatings: ReturnType<typeof vi.fn>;
  };
  let websocketSpy: {
    initConnection: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    gameMessages$: any;
  };
  let userRepoSpy: {
    getOwnAccount: ReturnType<typeof vi.fn>;
    getXpInfo: ReturnType<typeof vi.fn>;
    getUsername: ReturnType<typeof vi.fn>;
    getId: ReturnType<typeof vi.fn>;
  };

  let iconServiceSpy: {
    getAvatarColor: ReturnType<typeof vi.fn>;
  };

  let gameStateSpy: {
    startingTime: { set: ReturnType<typeof vi.fn> };
    increment: { set: ReturnType<typeof vi.fn> };
    nombreRival: { set: ReturnType<typeof vi.fn> };
  };
  let gameRepoSpy: {
    getPausedGame: ReturnType<typeof vi.fn>;
  }

  beforeEach(async () => {
    // Mock del friendRepository
    friendRepoSpy = {
      getFriends: vi.fn().mockReturnValue(of([])),
      getRequestFriends: vi.fn().mockReturnValue(of([])),
      getSentRequests: vi.fn().mockReturnValue(of([])),
      addFriend: vi.fn().mockReturnValue(of(true)),
      deleteFriend: vi.fn().mockReturnValue(of(true)),
      acceptRequest: vi.fn().mockReturnValue(of(true)),
      getAllRatings: vi.fn().mockReturnValue(of({ blitz: 1200, rapid: 1300, classic: 1400, extended: 1500 } as AllRatingsDTO)),
    };

    userRepoSpy = {
      getOwnAccount: vi.fn().mockReturnValue(
        of({
          account_id: '1',
          username: 'testUser',
          level: 1,
          avatar: 0
        })
      ),
      getXpInfo: vi.fn().mockReturnValue(
        of({
          xp: 50,
          required_xp: 100
        })
      ),
      getUsername: vi.fn().mockReturnValue('testUser'),
      getId: vi.fn().mockReturnValue(1),
    };

iconServiceSpy = {
  getAvatarColor: vi.fn().mockReturnValue('blue'),
};

    // Mock del websocket para lo de desafiar
    websocketSpy = {
      initConnection: vi.fn(),
      close: vi.fn(),
      gameMessages$: of({ type: 'challenge_accepted' }),
    };

    gameStateSpy = {
      startingTime: { set: vi.fn() },
      increment: { set: vi.fn() },
      nombreRival: { set: vi.fn() },
    };

    gameRepoSpy = {
      getPausedGame: vi.fn().mockReturnValue(of([])),
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Social);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture.detectChanges(); // esto ejecuta ngOnInit()
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ------------------------------------------------------------------
  // Tests de inicializacion
  // ------------------------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar amigos, solicitudes recibidas y enviadas al iniciar', () => {
    expect(friendRepoSpy.getFriends).toHaveBeenCalled();
    expect(friendRepoSpy.getRequestFriends).toHaveBeenCalled();
    expect(friendRepoSpy.getSentRequests).toHaveBeenCalled();
  });

  it('debería almacenar los amigos en la señal friends', () => {
    const mockFriends: FriendSummary[] = [
      { account_id: '1', username: 'Ana', level: 5, avatar: 1 },
    ];
    friendRepoSpy.getFriends.mockReturnValue(of(mockFriends));
    component.loadFriends(); // forzamos recarga
    expect(component.friends()).toEqual(mockFriends);
  });

  // ------------------------------------------------------------------
  // Tests de añadir amigo
  // ------------------------------------------------------------------
  it('debería mostrar error si el nombre de usuario está vacío al añadir amigo', () => {
    component.usernameInput = { nativeElement: { value: '' } } as any;
    component.addFriend();
    expect(component.errorAmigoNombreNoValido()).toBe(true);
    expect(friendRepoSpy.addFriend).not.toHaveBeenCalled();
  });

  it('debería llamar a addFriend con el nombre correcto y cerrar popup si éxito', async () => {
    component.usernameInput = { nativeElement: { value: 'nuevo_usuario' } } as any;
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
    component.usernameInput = { nativeElement: { value: 'nuevo_usuario' } } as any;
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
    component.sentRequests.set([{ account_id: '1', username: 'destinatario', level: 1, avatar: 0 }]);
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
    const friend = { account_id: '1', username: 'rival', level: 2, avatar: 0 };
    component.openChallengeConfig(friend);
    component.selectedBoard.set(2);
    component.selectedMode.set({ id: 'blitz', baseSeconds: 300, increments: [0,2,5] });
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