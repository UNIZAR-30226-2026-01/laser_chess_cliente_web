import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';
import { FriendSummary } from '../../model/social/FriendSummary';
import { FriendSummaryExtended } from '../../model/social/FriendSummaryExtended';
import { FriendshipRequest } from '../../model/social/FriendshipRequest';
import { Websocket } from '../../model/remote/websocket';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';
import { FriendRespository } from '../../repository/friend-respository';
import { GameState } from '../../utils/game-state';
import { GameResume } from '../../model/game/GameResume';
import { GameRepository } from '../../repository/game-repository';
import { UserRespository } from '../../repository/user-respository';
import { BoardState } from '../../utils/board-state';
import { NotificationService } from '../../model/notifications/notification';
import { Popup } from '../../shared/popups/popup';
import { ChallengeFlow } from '../../shared/challenge-flow/challenge-flow';
import { ChallengeFlowService } from '../../services/challenge-flow';

@Component({
  selector: 'app-social',
  imports: [TopRow, FormsModule, MatIconModule, Popup, ChallengeFlow],
  templateUrl: './social.html',
  styleUrl: './social.css',
})
export class Social implements OnInit, OnDestroy {

  boardState  = inject(BoardState);
  flow        = inject(ChallengeFlowService);   // ← toda la lógica del reto vive aquí

  private friendService = inject(FriendRespository);
  private userService   = inject(UserRespository);
  private gameState     = inject(GameState);
  private websocket     = inject(Websocket);
  private gameRepo      = inject(GameRepository);

  id = this.userService.getId();

  // Estado de la vista
  public state        = signal(true);  // true → Social, false → Partidas pausadas
  public popUP_newFriend = signal(false);
  public popUP_request   = signal(false);

  // Listas
  friends      = signal<FriendSummaryExtended[]>([]);
  request      = signal<FriendSummary[]>([]);
  sentRequests = signal<FriendSummary[]>([]);
  partidas     = signal<GameResume[]>([]);

  // Flags de carga
  public friendsInfo      = signal(false);
  public gameInfo         = signal(false);
  public requestInfo      = signal(false);
  public sentRequestsInfo = signal(false);

  // Popup userInfo
  public popUP_userInfo      = signal(false);
  public selectedUser        = signal<FriendSummaryExtended | null>(null);
  public selectedUserContext = signal<'friend' | 'received_request' | 'sent_request'>('friend');
  public selectedUserEloBlitz    = signal(0);
  public selectedUserEloRapid    = signal(0);
  public selectedUserEloClassic  = signal(0);
  public selectedUserEloExtended = signal(0);

  public requestTabState = signal<'received' | 'sent'>('received');

  public errorAmigoNombreNoValido = signal<string | null>(null);

  private wsSubscription: any;

  nuevoAmigo = signal(false);

  

  constructor(
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadFriends();
    this.loadRequests();
    this.loadSentRequests();
    this.loadGames();

    this.notificationService.wakeSocial$.subscribe(() => {
      this.loadRequests();
      this.loadSentRequests();
      this.loadFriends();
    });

    this.websocket.connectionClosed$.subscribe(() => this.flow.handleChallengeCancelled());
    this.websocket.connectionError$.subscribe(()  => this.flow.handleChallengeCancelled());

    const username = this.route.snapshot.params['username'];
    window.history.replaceState({}, '', '/social');
    if (username) {
      const req: FriendshipRequest = { receiver_username: username };
      this.friendService.addFriend(req).subscribe({
        next:  () => { this.openRequestPopup(); this.requestTabState.set('sent'); },
        error: () => { this.openRequestPopup(); this.requestTabState.set('sent'); }
      });
    }
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }


  refreshSocialState(): void {
    this.loadFriends();
    this.loadRequests();
    this.loadSentRequests();
  }

  loadFriends(): void {
    this.friendService.getFriends().subscribe({
      next:  (data: FriendSummary[]) => { this.friends.set(data || []); this.friendsInfo.set(true); },
      error: (err: any) => console.error('Error al cargar amigos:', err)
    });
  }

  loadRequests(): void {
    this.requestInfo.set(false);
    this.friendService.getRequestFriends().subscribe({
      next:  (data: FriendSummary[]) => { this.request.set(data || []); this.requestInfo.set(true); },
      error: (err: any) => { console.error('Error al cargar solicitudes:', err); this.requestInfo.set(true); }
    });
  }

  loadSentRequests(): void {
    this.sentRequestsInfo.set(false);
    this.friendService.getSentRequests().subscribe({
      next:  (data: FriendSummary[]) => { this.sentRequests.set(data || []); this.sentRequestsInfo.set(true); },
      error: (err: any) => { console.error('Error al cargar solicitudes enviadas:', err); this.sentRequestsInfo.set(true); }
    });
  }

  loadGames(): void {
    this.gameRepo.getPausedGame().subscribe({
      next:  (data: GameResume[]) => { this.partidas.set(data); this.gameInfo.set(true); },
      error: (err: any) => console.error('Error al cargar partidas:', err)
    });
  }

 

  openRequestPopup(): void {
    this.loadRequests();
    this.loadSentRequests();
    this.requestTabState.set('received');
    this.popUP_request.set(true);
  }

  setRequestTab(tab: 'received' | 'sent'): void {
    this.requestTabState.set(tab);
  }

  

  openUserInfo(user: FriendSummaryExtended, context: 'friend' | 'received_request' | 'sent_request' = 'friend'): void {
    this.selectedUser.set(user);
    this.selectedUserContext.set(context);
    this.popUP_userInfo.set(true);

    if (!user.account_id) return;

    this.friendService.getAllRatings(Number(user.account_id)).subscribe({
      next: (ratings: AllRatingsDTO) => {
        this.selectedUserEloBlitz.set(ratings.blitz);
        this.selectedUserEloRapid.set(ratings.rapid);
        this.selectedUserEloClassic.set(ratings.classic);
        this.selectedUserEloExtended.set(ratings.extended);
      },
      error: (err: any) => console.error('Error al obtener ELOs:', err)
    });

    this.friendService.getAccount(Number(user.account_id)).subscribe({
      next: (account) => {
        if (!account) return;
        this.selectedUser.set({
          ...user,
          avatar: account.avatar,
          board_skin: account.board_skin,
          piece_skin: account.piece_skin,
          win_animation: account.win_animation
        });
      },
      error: (err: any) => console.error('Error al obtener cuenta completa:', err)
    });
  }

  closeUserInfo(): void {
    this.popUP_userInfo.set(false);
    this.selectedUser.set(null);
  }


  acceptFromPopup(): void {
    if (this.selectedUser()) { this.acceptRequest(this.selectedUser()!.username); this.closeUserInfo(); }
  }

  rejectFromPopup(): void {
    if (this.selectedUser()) { this.rejectRequest(this.selectedUser()!.username); this.closeUserInfo(); }
  }

  cancelSentFromPopup(): void {
    if (this.selectedUser()) { this.cancelSentRequest(this.selectedUser()!.username); this.closeUserInfo(); }
  }

  deleteFriendFromPopup(): void {
    if (this.selectedUser()) { this.deleteFriend(this.selectedUser()!.username); this.closeUserInfo(); }
  }

  challengeFromPopup(): void {
    const user = this.selectedUser();
    if (user) { this.closeUserInfo(); this.flow.openChallengeConfig(user); }
  }


 addFriendFromPopup(username: string): void {
  username = username.trim();
  if (!username) { this.errorAmigoNombreNoValido.set('Introduce un nombre de usuario'); return; }

  this.errorAmigoNombreNoValido.set(null);
  this.friendService.addFriend({ receiver_username: username }).subscribe({
    next: (result) => {
      switch (result) {
        case 'ok':
          this.popUP_newFriend.set(false);
          this.nuevoAmigo.set(true);
          setTimeout(() => this.nuevoAmigo.set(false), 2000);
          this.refreshSocialState();
          break;
        case 'not_found':
          this.errorAmigoNombreNoValido.set('Este usuario no existe');
          break;
        case 'already_friends':
          this.errorAmigoNombreNoValido.set('Ya sois amigos o tienes una solicitud pendiente con este usuario');
          break;
        case 'error':
          this.errorAmigoNombreNoValido.set('Ha ocurrido un error, inténtalo de nuevo');
          break;
      }
    }
  });
}


  acceptRequest(requestUsername: string): void {
    if (!requestUsername) return;
    this.request.set(this.request().filter(r => r.username !== requestUsername)); // optimista
    this.friendService.acceptRequest(requestUsername).subscribe({
      next: (result) => {
        if (result) { this.refreshSocialState(); this.popUP_request.set(false); }
      },
      error: (err: any) => console.error('Error al aceptar solicitud:', err)
    });
  }

  rejectRequest(requestUsername: string): void {
    if (!requestUsername) return;
    this.friendService.deleteFriend(requestUsername).subscribe({
      next: (result) => {
        if (result) {
          this.request.set(this.request().filter(r => r.username !== requestUsername));
          this.refreshSocialState();
          if (this.request().length === 0) this.popUP_request.set(false);
        }
      },
      error: (err: any) => console.error('Error al rechazar solicitud:', err)
    });
  }

  cancelSentRequest(requestUsername: string): void {
    if (!requestUsername) return;
    this.friendService.deleteFriend(requestUsername).subscribe({
      next: (result) => {
        if (result) {
          this.sentRequests.set(this.sentRequests().filter(r => r.username !== requestUsername));
          this.refreshSocialState();
        }
      },
      error: (err: any) => console.error('Error al cancelar solicitud:', err)
    });
  }

  deleteFriend(friendUsername: string): void {
    if (!friendUsername) return;
    this.friendService.deleteFriend(friendUsername).subscribe({
      next: (result) => { if (result) this.refreshSocialState(); },
      error: (err: any) => console.error('Error al eliminar amigo:', err)
    });
  }


  resumeGame(gameId: number, p1: number, p2: number): void {
    const rivalId = this.id === p1 ? p2 : p1;
    this.userService.getAccount(rivalId).subscribe({
      next: (response) => {
        this.flow.friendToChallenge = {
          username:   response.username   || 'Rival Desconocido',
          account_id: response.userId     || 0,
          level:      response.level      || 0,
          avatar:     response.avatar     || 0,
        };
        this.flow.sendChallenge(gameId);
      },
      error: (err: any) => {
        console.error('Error al obtener el nombre del rival:', err);
        this.gameState.nombreRival.set('Rival Desconocido');
      }
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60000);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}