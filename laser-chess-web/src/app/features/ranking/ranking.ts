import { Component, inject, OnInit } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopRow } from '../../shared/top-row/top-row';
import { RankingRepository, RankingPlayer, UserRankingInfo, EloType } from '../../repository/ranking-repository';
import { MatIconModule } from '@angular/material/icon';
import { FriendRespository } from '../../repository/friend-respository';
import { FriendSummary } from '../../model/social/FriendSummary';
import { FriendSummaryExtended } from '../../model/social/FriendSummaryExtended';
import { FriendshipRequest } from '../../model/social/FriendshipRequest';
import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';
import { Remote } from '../../model/remote/remote';
import { BoardState } from '../../utils/board-state';
import { Popup } from '../../shared/popups/popup';
import { ChallengeFlow } from '../../shared/challenge-flow/challenge-flow';
import { ChallengeFlowService } from '../../services/challenge-flow';
import { UserRespository } from '../../repository/user-respository';
import { XpInfo } from '../../repository/user-respository';

@Component({
  selector: 'app-ranking',
  imports: [CommonModule, FormsModule, TopRow, MatIconModule, Popup, ChallengeFlow],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.css']
})
export class Ranking implements OnInit {

  private rankingRepo = inject(RankingRepository);
  private friendRepo  = inject(FriendRespository);
  private remote      = inject(Remote);
  boardState          = inject(BoardState);
  flow                = inject(ChallengeFlowService);  
  private userRepo    = inject(UserRespository);

  // Ranking
  public loading         = signal(true);
  public error           = signal<string | null>(null);
  public selectedEloType = signal<EloType>('blitz');
  public topPlayers      = signal<RankingPlayer[]>([]);
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

  public selectedUserXpPercentage = signal(0);
  public selectedUserXpRequired  = signal(0);
  public selectedUserXpCurrent  = signal(0);

  // Relaciones (para determinar contexto en el popup)
  public friends      = signal<FriendSummary[]>([]);
  public sentRequests = signal<FriendSummary[]>([]);

  ngOnInit(): void {
    this.loadRanking();
    this.loadFriends();
    this.loadSentRequests();
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

  onSelectEloType(type: EloType): void {
    if (this.selectedEloType() === type) return;
    this.selectedEloType.set(type);
    this.loadRanking();
  }

  loadRanking(): void {
    this.loading.set(true);
    this.error.set(null);
    this.topPlayers.set([]);
    this.userInfo.set(null);

    const eloType = this.selectedEloType();

    this.rankingRepo.getTop100(eloType).subscribe({
      next: (players) => {
        this.topPlayers.set(players);
        this.rankingRepo.getCurrentUserPosition(eloType).subscribe({
          next:  (info) => { this.userInfo.set(info); this.loading.set(false); },
          error: (err)  => {
            console.error('Error al obtener la posición del usuario:', err);
            this.error.set('No se pudo obtener tu posición en el ranking. Inténtalo más tarde.');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar el top 100:', err);
        this.error.set('No se pudo cargar el ranking. Inténtalo más tarde.');
        this.loading.set(false);
      }
    });
  }


  openUserInfo(player: RankingPlayer): void {
    const currentUserId = this.remote.getAccountId();
    const isSelf        = currentUserId === player.userId;

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

    this.userRepo.getXpInfoFriend(player.userId).subscribe({
              next: (data: XpInfo) => {
                if (data.required_xp > 0) {
                  const percentage = (data.xp / data.required_xp) * 100;
                  this.selectedUserXpPercentage.set(percentage);
                  this.selectedUserXpCurrent.set(data.xp);
                  this.selectedUserXpRequired.set(data.required_xp);
                  
                }
              },
              error: (err) => console.error('Error cargando XP', err)
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
    var userSummary : FriendSummaryExtended = {
      username:   player.username,
      account_id: player.userId,
      level:      0,
      avatar:     0,
    }
    
    this.userRepo.getAccount(player.userId).subscribe(profile => {
      userSummary = {
        username:   player.username,
        account_id: player.userId,
        level:      profile.level,
        avatar:     profile.avatar,
        xp: profile.xp,
        board_skin:    profile.board_skin,
        piece_skin:    profile.piece_skin,
        win_animation: profile.win_animation,
      };

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