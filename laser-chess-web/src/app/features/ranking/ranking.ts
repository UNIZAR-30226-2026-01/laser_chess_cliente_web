// src/app/ranking/ranking.ts
import { Component, inject, OnInit } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopRow } from '../../shared/top-row/top-row';
import { RankingRepository, RankingPlayer, UserRankingInfo, EloType } from '../../repository/ranking-repository';

//Como en social vaya para los pop-up jeje
import { FriendRespository } from '../../repository/friend-respository';
import { FriendSummary } from '../../model/social/FriendSummary';
import { FriendSummaryExtended } from '../../model/social/FriendSummaryExtended'
import { FriendshipRequest } from '../../model/social/FriendshipRequest';
import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';
import { Remote } from '../../model/remote/remote';


@Component({
  selector: 'app-ranking',
  imports: [CommonModule, FormsModule, TopRow],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.css']
})
export class Ranking implements OnInit {
  private rankingRepo = inject(RankingRepository);
  private friendRepo = inject(FriendRespository);
  private remote = inject(Remote); 

  // Señales
  public loading = signal(true);
  public error = signal<string | null>(null);
  public selectedEloType = signal<EloType>('blitz');
  
  // Top 100 jugadores
  public topPlayers = signal<RankingPlayer[]>([]);
  
  // Información del usuario actual
  public userInfo = signal<UserRankingInfo | null>(null);

  // Lista de tipos de elo
  public eloTypes: { id: EloType; label: string }[] = [
    { id: 'blitz', label: 'Blitz' },
    { id: 'rapid', label: 'Rapid' },
    { id: 'classic', label: 'Classic' },
    { id: 'extended', label: 'Extended' }
  ];

  // Pop-up de usuario
  public popUP_userInfo = signal(false);
  public selectedUser = signal<FriendSummaryExtended | null>(null);
  public selectedUserContext = signal<'self' | 'friend' | 'sent_request' | 'none'>('none');
  public selectedUserEloBlitz = signal(0);
  public selectedUserEloRapid = signal(0);
  public selectedUserEloClassic = signal(0);
  public selectedUserEloExtended = signal(0);

  // Listas de relaciones
  public friends = signal<FriendSummary[]>([]);
  public sentRequests = signal<FriendSummary[]>([]);



  ngOnInit(): void {
    this.loadRanking();
    this.loadFriends();
    this.loadSentRequests();
  }


  // Cargar lista de amigos
  loadFriends(): void {
    this.friendRepo.getFriends().subscribe({
      next: (data) => this.friends.set(data || []),
      error: (err) => console.error('Error al cargar amigos:', err)
    });
  }

  // Cargar solicitudes enviadas pendientes
  loadSentRequests(): void {
    this.friendRepo.getSentRequests().subscribe({
      next: (data) => this.sentRequests.set(data || []),
      error: (err) => console.error('Error al cargar solicitudes enviadas:', err)
    });
  }


  // Cambiar tipo de ELO y recargar
  onSelectEloType(type: EloType): void {
    if (this.selectedEloType() === type) return;
    this.selectedEloType.set(type);
    this.loadRanking();
  }


  // Top 100 con mi posición
  loadRanking(): void {
    this.loading.set(true);
    this.error.set(null);
    this.topPlayers.set([]);
    this.userInfo.set(null);

    const eloType = this.selectedEloType();

    this.rankingRepo.getTop100(eloType).subscribe({
      next: (players) => {
        this.topPlayers.set(players);
        // Ver cual es mi posicion
        this.rankingRepo.getCurrentUserPosition(eloType).subscribe({
          next: (info) => {
            this.userInfo.set(info);
            this.loading.set(false);
          },
          error: (err) => {
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



  //La funcionalidad para los pop-ups
  openUserInfo(player: RankingPlayer): void {
    const currentUserId = this.remote.getAccountId();
    // Si es el mismo usuario ojo
    if (currentUserId === player.userId) {
      this.selectedUserContext.set('self');
      this.friendRepo.getAllRatings(player.userId).subscribe({
        next: (ratings: AllRatingsDTO) => {
          this.selectedUserEloBlitz.set(ratings.blitz);
          this.selectedUserEloRapid.set(ratings.rapid);
          this.selectedUserEloClassic.set(ratings.classic);
          this.selectedUserEloExtended.set(ratings.extended);
        },
        error: (err) => {
          console.error('Error al obtener ELOs propios:', err);
        }
      });
      const userSummary: FriendSummaryExtended = {
        username: player.username,
        account_id: player.userId.toString(),
        level: 0,
        avatar: 0
      };
      this.selectedUser.set(userSummary);
      this.popUP_userInfo.set(true);
      return;
    }
    
    // Es otro usuario
    // Obtener los 4 ELOs del usuario
    this.friendRepo.getAllRatings(player.userId).subscribe({
      next: (ratings: AllRatingsDTO) => {
        this.selectedUserEloBlitz.set(ratings.blitz);
        this.selectedUserEloRapid.set(ratings.rapid);
        this.selectedUserEloClassic.set(ratings.classic);
        this.selectedUserEloExtended.set(ratings.extended);

        // Determinar  si es amigo o ya se ha enviado
        const isFriend = this.friends().some(f => f.username === player.username);
        const isSent = this.sentRequests().some(s => s.username === player.username);

        if (isFriend) {
          this.selectedUserContext.set('friend');
        } else if (isSent) {
          this.selectedUserContext.set('sent_request');
        } else {
          this.selectedUserContext.set('none');
        }

        const userSummary: FriendSummaryExtended  = {
          username: player.username,
          account_id: player.userId.toString(),
          level: 0,
          avatar: 0
        };
        this.selectedUser.set(userSummary);
        this.popUP_userInfo.set(true);
      },
      error: (err) => {
        console.error('Error al obtener ELOs del usuario:', err);
        this.selectedUserEloBlitz.set(0);
        this.selectedUserEloRapid.set(0);
        this.selectedUserEloClassic.set(0);
        this.selectedUserEloExtended.set(0);

        const isFriend = this.friends().some(f => f.username === player.username);
        const isSent = this.sentRequests().some(s => s.username === player.username);
        if (isFriend) this.selectedUserContext.set('friend');
        else if (isSent) this.selectedUserContext.set('sent_request');
        else this.selectedUserContext.set('none');

        const userSummary: FriendSummaryExtended  = {
          username: player.username,
          account_id: player.userId.toString(),
          level: 0,
          avatar: 0
        };
        this.selectedUser.set(userSummary);
        this.popUP_userInfo.set(true);
      }
    });
  }

  closeUserInfo(): void {
    this.popUP_userInfo.set(false);
    this.selectedUser.set(null);
  }

  // Enviar solicitud de amistad
  sendFriendRequest(): void {
    const user = this.selectedUser();
    if (!user) return;

    const request: FriendshipRequest = { receiver_username: user.username };
    this.friendRepo.addFriend(request).subscribe({
      next: (result) => {
        if (result) {
          console.log('Solicitud enviada a', user.username);
          // Recargar solicitudes enviadas
          this.loadSentRequests();
          // Cambiar contexto localmente
          this.selectedUserContext.set('sent_request');
          // Opcional: cerrar pop-up después de un momento
          // this.closeUserInfo();
        }
      },
      error: (err) => console.error('Error al enviar solicitud:', err)
    });
  }

  // Cancelar solicitud enviada
  cancelFriendRequest(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.friendRepo.deleteFriend(user.username).subscribe({
      next: (result) => {
        if (result) {
          console.log('Solicitud cancelada a', user.username);
          this.loadSentRequests();
          this.selectedUserContext.set('none');
        }
      },
      error: (err) => console.error('Error al cancelar solicitud:', err)
    });
  }

  // Eliminar amigo
  deleteFriend(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.friendRepo.deleteFriend(user.username).subscribe({
      next: (result) => {
        if (result) {
          console.log('Amigo eliminado:', user.username);
          this.loadFriends();
          this.selectedUserContext.set('none');
          this.closeUserInfo();
        }
      },
      error: (err) => console.error('Error al eliminar amigo:', err)
    });
  }

}