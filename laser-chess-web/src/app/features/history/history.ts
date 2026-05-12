import { Component , signal, inject} from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';
import { TimerService } from '../../services/timer-service';
import { Board } from '../../shared/board/board';
import { GameLogicService } from '../../services/game-logic-service';
import { HistoryService } from '../../services/history-service';
import { GameUtils } from '../../utils/game-utils';
import { BoardState } from '../../utils/board-state';
import { Popup } from '../../shared/popups/popup'; 
import { FriendSummaryExtended } from '../../model/social/FriendSummaryExtended'
import { ChallengeFlow } from '../../shared/challenge-flow/challenge-flow';
import { ChallengeFlowService } from '../../services/challenge-flow';
import { UserRankingInfo, EloType } from '../../repository/ranking-repository';
import { FriendRespository } from '../../repository/friend-respository';
import { FriendSummary } from '../../model/social/FriendSummary';
import { FriendshipRequest } from '../../model/social/FriendshipRequest';
import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';
import { Remote } from '../../model/remote/remote';
import { MyProfile } from '../../model/user/MyProfile';
import { UserRespository } from '../../repository/user-respository';




@Component({
  selector: 'app-history',
  imports: [TopRow, Board, Popup, ChallengeFlow],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History {
  boardState = inject(BoardState);

  timerService = inject(TimerService);


  gameService = inject(GameLogicService);
  historyState = inject(HistoryService);
  gameUtils = inject(GameUtils);


  columnas = 10;
  filas = 8;
  listaPiezas = this.historyState.listaPiezas;
  laserPath = this.historyState.laserPath;


  miTiempo = this.historyState.miTiempo;
  tiempoRival = this.historyState.tiempoRival;

  nombreRival = this.historyState.nombreRival;
  miNombre = this.historyState.miNombre;

  miAvatar = this.historyState.miAvatar;
  rivalAvatar = this.historyState.rivalAvatar;



    private friendRepo  = inject(FriendRespository);
    private userRepo = inject(UserRespository)
    private remote      = inject(Remote);
    flow                = inject(ChallengeFlowService);  
  
    // Ranking
    public loading         = signal(true);
    public error           = signal<string | null>(null);
 
    public userInfo        = signal<UserRankingInfo | null>(null);
  
    public eloTypes: { id: EloType; label: string }[] = [
      { id: 'blitz',    label: 'Blitz'    },
      { id: 'rapid',    label: 'Rapid'    },
      { id: 'classic',  label: 'Classic'  },
      { id: 'extended', label: 'Extended' },
    ];
  
    // Popup userInfo
    public popUP_userInfo      = signal(false);
    public selectedUser        = signal<FriendSummaryExtended | null>(null);
    public selectedUserContext = signal<'self' | 'friend' | 'sent_request' | 'none'>('none');
    public selectedUserEloBlitz    = signal(0);
    public selectedUserEloRapid    = signal(0);
    public selectedUserEloClassic  = signal(0);
    public selectedUserEloExtended = signal(0);
  
    // Relaciones (para determinar contexto en el popup)
    private friends      = signal<FriendSummary[]>([]);
    private sentRequests = signal<FriendSummary[]>([]);
  
    ngOnInit(){
      const saved = localStorage.getItem('historyGame');
      if (saved) {
        this.historyState.historySelectedGame.set(JSON.parse(saved));
      }
      this.historyState.laserPath.set([]);

      this.historyState.inicializarTablero();
      this.loadFriends();
      this.loadSentRequests();
    }

    siguiente(){
      this.historyState.avanzar();
    }
    anterior(){
      this.historyState.retroceder();
    }

    primero(){
      this.historyState.irAlPrimero();
    }
    ultimo(){
      this.historyState.irAlUltimo();
    }
  
  
    loadFriends(): void {
      this.friendRepo.getFriends().subscribe({
        next:  (data) => this.friends.set(data || []),
        error: (err)  => console.error('Error al cargar amigos:', err)
      });
    }
  
    loadSentRequests(): void {
      this.friendRepo.getSentRequests().subscribe({
        next:  (data) => this.sentRequests.set(data || []),
        error: (err)  => console.error('Error al cargar solicitudes enviadas:', err)
      });
    }
  
  
  
  
    openUserInfo(player: MyProfile): void {
      if(player.userId === 1){ return; };
      const currentUserId = this.remote.getAccountId();
      const isSelf        = currentUserId === player.userId;
  
      var userSummary: FriendSummaryExtended = {
        username:   player.username,
        account_id: player.userId,
        level:      0,
        avatar:     0,
      };
  
      this.friendRepo.getAllRatings(player.userId).subscribe({
        next: (ratings: AllRatingsDTO) => {
          this.selectedUserEloBlitz.set(ratings.blitz);
          this.selectedUserEloRapid.set(ratings.rapid);
          this.selectedUserEloClassic.set(ratings.classic);
          this.selectedUserEloExtended.set(ratings.extended);
        },
        error: () => {
          this.selectedUserEloBlitz.set(0);
          this.selectedUserEloRapid.set(0);
          this.selectedUserEloClassic.set(0);
          this.selectedUserEloExtended.set(0);
        }
      });
  
      if (isSelf) {
        this.selectedUserContext.set('self');
      } else if (this.friends().some(f => f.username === player.username)) {
        this.selectedUserContext.set('friend');
      } else if (this.sentRequests().some(s => s.username === player.username)) {
        this.selectedUserContext.set('sent_request');
      } else {
        this.selectedUserContext.set('none');
      }
  
      this.userRepo.getAccount(player.userId).subscribe(profile => {
        this.historyState.perfilRivalSummary().board_skin = profile.board_skin;
        this.historyState.perfilRivalSummary().piece_skin = profile.piece_skin;
        this.historyState.perfilRivalSummary().win_animation = profile.win_animation;
        this.selectedUser.set(userSummary);
        this.popUP_userInfo.set(true);
      });
    }
  
    closeUserInfo(): void {
      this.popUP_userInfo.set(false);
      this.selectedUser.set(null);
    }
  
  
    challengeFromPopup(): void {
      const user = this.selectedUser();
      if (user) { this.closeUserInfo(); this.flow.openChallengeConfig(user); }
    }
  
    sendFriendRequest(): void {
      const user = this.selectedUser();
      if (!user) return;
      this.friendRepo.addFriend({ receiver_username: user.username } as FriendshipRequest).subscribe({
        next: (result) => {
          if (result) { this.loadSentRequests(); this.selectedUserContext.set('sent_request'); }
        },
        error: (err) => console.error('Error al enviar solicitud:', err)
      });
    }
  
    cancelFriendRequest(): void {
      const user = this.selectedUser();
      if (!user) return;
      this.friendRepo.deleteFriend(user.username).subscribe({
        next: (result) => {
          if (result) { this.loadSentRequests(); this.selectedUserContext.set('none'); }
        },
        error: (err) => console.error('Error al cancelar solicitud:', err)
      });
    }
  
    deleteFriend(): void {
      const user = this.selectedUser();
      if (!user) return;
      this.friendRepo.deleteFriend(user.username).subscribe({
        next: (result) => {
          if (result) { this.loadFriends(); this.selectedUserContext.set('none'); this.closeUserInfo(); }
        },
        error: (err) => console.error('Error al eliminar amigo:', err)
      });
    }
  }
  
  

