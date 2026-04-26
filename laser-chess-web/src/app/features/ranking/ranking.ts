// src/app/ranking/ranking.ts
import { Component, inject, OnInit } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopRow } from '../../shared/top-row/top-row';
import { RankingRepository, RankingPlayer, UserRankingInfo, EloType } from '../../repository/ranking-repository';
import { MatIconModule } from '@angular/material/icon';

//Como en social vaya para los pop-up jeje
import { FriendRespository } from '../../repository/friend-respository';
import { FriendSummary } from '../../model/social/FriendSummary';
import { FriendSummaryExtended } from '../../model/social/FriendSummaryExtended'
import { FriendshipRequest } from '../../model/social/FriendshipRequest';
import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';
import { Remote } from '../../model/remote/remote';


import { Websocket } from '../../model/remote/websocket';          // para lo nuevo del weboscket
import { GameState } from '../../model/remote/game-state'


@Component({
  selector: 'app-ranking',
  imports: [CommonModule, FormsModule, TopRow, MatIconModule],
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



  //PARA LA CONFIGURACION DE LA PARTIDA
    // Popup de configuración de las partidas
    public showConfigPopup = signal(false);
    public friendToChallenge: FriendSummary | null = null;
    public errorAmigoNombreNoValido = signal(false); // Para mostrar mensaje de error si el input de nuevo amigo esta vacio

    private gameState = inject(GameState);


    // Modos de tiempo disponibles (es lo que pone en la documentacion de los elegido)
    public timeModes = [
      { id: 'blitz', label: 'Blitz', baseSeconds: 300, increments: [0, 2, 5] },
      { id: 'rapid', label: 'Rapid', baseSeconds: 900, increments: [0, 5, 10] },
      { id: 'classic', label: 'Classic', baseSeconds: 1800, increments: [0, 10, 15] },
      { id: 'extended', label: 'Extended', baseSeconds: 3600, increments: [0, 15, 20] },
      { id: 'custom', label: 'Personalizado', baseSeconds: null, increments: null }
    ];
    public boards = [
      { id: 1, name: 'ACE' },
      { id: 2, name: 'CURIOSITY' },
      { id: 3, name: 'GRAIL' },
      { id: 4, name: 'MERCURY' },
      { id: 5, name: 'SOPHIE' }
    ];
    public selectedBoard = signal<number>(1); // ACE por defecto
    public selectedMode = signal<any>(this.timeModes[0]); // Blitz por defecto
    public selectedIncrement = signal<number>(0); // incremento en segundos


    // Solo para modo personalizado
    public customMinutes = signal<number>(5);
    public customIncrementSec = signal<number>(0);

    //WEBSOCKET
    public popUP_waiting = signal(false);// Para el nuevo pop-up del ESPERANDO
    private websocket = inject(Websocket);// Para meter el websocket en social
    private wsSubscription: any;//Para limpiar la sub del socket despues


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



  //Se me olvidó que a un amigo se le puede  retar a una partida privada
  challengeFromPopup() {
    const user = this.selectedUser();  // Guardar ANTES MUY IMPORTANTE SIN esto no van las privadas
    if (user) {
      this.closeUserInfo();          // Se borra igualmente pero como esta guardado da igual
      this.openChallengeConfig(user);
    }
  }

  // Abre el popup al hacer clic en Retar
  openChallengeConfig(friend: FriendSummaryExtended): void {
    this.friendToChallenge = friend;
    this.selectedBoard.set(1);
    this.selectedMode.set(this.timeModes[0]);
    this.selectedIncrement.set(0);
    this.customMinutes.set(5);
    this.customIncrementSec.set(0);
    this.showConfigPopup.set(true);
  }


  // Cierra el popup
  closeConfigPopup(): void {
    this.showConfigPopup.set(false);
    this.friendToChallenge = null;
  }

  // Para cambair el modo de tiempo y ajustar el incremento de tempo
  onModeChange(mode: any): void {
    this.selectedMode.set(mode);
    if (mode.id !== 'custom') {
      // Restablecer a primer incremento disponible
      this.selectedIncrement.set(mode.increments[0]);
    }
  }

  // Parámetros finales según el modo seleccionado
  getChallengeParams(): { startingTime: number, timeIncrement: number } {
    const mode = this.selectedMode();
    if (mode.id === 'custom') {
      let minutes = this.customMinutes();
      if (minutes > 180) minutes = 180;
      if (minutes < 1) minutes = 1;
      let inc = this.customIncrementSec();
      if (inc > 60) inc = 60;
      if (inc < 0) inc = 0;
      return { startingTime: minutes * 60, timeIncrement: inc };
    } else {
      return { startingTime: mode.baseSeconds, timeIncrement: this.selectedIncrement() };
    }
  }



  // Inciiar a una partida amistosa DESAFIAR
  sendChallenge(): void {
    if (!this.friendToChallenge) return;

    const board = this.selectedBoard();
    const { startingTime, timeIncrement } = this.getChallengeParams();

    const endpoint = 'challenge';
    const params = {
      username: this.friendToChallenge.username,
      board,
      starting_time: startingTime,
      time_increment: timeIncrement
    };
    this.gameState.startingTime.set(startingTime * 1000);
    this.gameState.increment.set(timeIncrement);
    this.gameState.nombreRival.set(this.friendToChallenge.username);
    console.log("tiempo ini: " + startingTime + ", incremento:  " + timeIncrement );

    this.websocket.initConnection(endpoint, params);


    this.closeConfigPopup();
    this.popUP_waiting.set(true);
  }

  // Esto es para mostrar el pop-up
  challengeFriend(friendUsername: string): void {
    const friend = this.friends().find(f => f.username === friendUsername);
    if (friend) {
      this.openChallengeConfig(friend);   // Abre
    } else {
      console.error('Amigo no encontrado');
    }
  }

  cancelWaiting(): void {
    this.websocket.close();
    this.popUP_waiting.set(false);
  }

}
