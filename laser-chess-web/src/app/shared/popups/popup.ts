

import { Component, Input, Output, EventEmitter, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FriendSummary } from '../../model/social/FriendSummary';
import { FriendSummaryExtended } from '../../model/social/FriendSummaryExtended';
import { UserRespository } from '../../repository/user-respository';
import { Router } from '@angular/router';

export type PopupType = 'none' | 'newFriend' | 'requests' | 'userInfo' | 'challengeConfig' | 'waiting';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './popup.html',
  styleUrls: ['./popup.css']
})
export class Popup {
  @Input() type: PopupType = 'none';
  private router = inject(Router);

  // popup newFriend
  @Input() newFriendError: string | null = null;
  @Output() newFriendAdd = new EventEmitter<string>();
  @Output() newFriendClose = new EventEmitter<void>();

  // popup requests
  @Input() requestsReceived: FriendSummary[] = [];
  @Input() requestsSent: FriendSummary[] = [];
  @Input() requestsLoading = false;
  @Input() requestsTab: 'received' | 'sent' = 'received';
  @Output() requestsTabChange = new EventEmitter<'received' | 'sent'>();
  @Output() requestsClose = new EventEmitter<void>();
  @Output() requestOpenUserInfo = new EventEmitter<{ user: FriendSummary, context: 'received_request' | 'sent_request' }>();

  // popup userInfo
  @Input() userInfoUser: FriendSummaryExtended | null = null;
  @Input() userInfoContext: 'friend' | 'received_request' | 'sent_request' | 'self' | 'none' = 'none';
  @Input() userInfoEloBlitz = 0;
  @Input() userInfoEloRapid = 0;
  @Input() userInfoEloClassic = 0;
  @Input() userInfoEloExtended = 0;
  @Input() userInfoXpCurrent = 0;
  @Input() userInfoXpRequired = 100;
  @Input() userInfoXpPercentage = 0;
  @Output() userInfoClose = new EventEmitter<void>();
  @Output() userInfoChallenge = new EventEmitter<void>();
  @Output() userInfoDeleteFriend = new EventEmitter<void>();
  @Output() userInfoAcceptRequest = new EventEmitter<void>();
  @Output() userInfoRejectRequest = new EventEmitter<void>();
  @Output() userInfoCancelSent = new EventEmitter<void>();
  @Output() userInfoSendFriendRequest = new EventEmitter<void>();

  // popup challengeConfig
  @Input() challengeFriendUsername: string | null = null;
  @Input() challengeBoards: { id: number; name: string }[] = [];
  @Input() challengeSelectedBoard = 'ACE';
  @Input() challengeTimeModes: any[] = [];
  @Input() challengeSelectedMode: any = null;
  @Input() challengeSelectedIncrement = 0;
  @Input() challengeCustomMinutes = 5;
  @Input() challengeCustomIncrementSec = 0;
  @Output() challengeConfigClose = new EventEmitter<void>();
  @Output() challengeModeChange = new EventEmitter<string>();
  @Output() challengeSelectedBoardChange = new EventEmitter<string>();
  @Output() challengeSelectedIncrementChange = new EventEmitter<number>();
  @Output() challengeCustomMinutesChange = new EventEmitter<number>();
  @Output() challengeCustomIncrementSecChange = new EventEmitter<number>();
  @Output() challengeSend = new EventEmitter<void>();

  // popup waiting
  @Output() waitingCancel = new EventEmitter<void>();

  userRepo = inject(UserRespository);
  // Helper para el popup de solicitudes
  onOpenUserInfo(user: FriendSummary, context: 'received_request' | 'sent_request') {
    this.requestOpenUserInfo.emit({ user, context });
  }

  // Helper para cambiar pestaña
  onTabChange(tab: 'received' | 'sent') {
    this.requestsTabChange.emit(tab);
  }

  // Cerrar
  close() {
    switch (this.type) {
      case 'newFriend': this.newFriendClose.emit(); break;
      case 'requests': this.requestsClose.emit(); break;
      case 'userInfo': this.userInfoClose.emit(); break;
      case 'challengeConfig': this.challengeConfigClose.emit(); break;
      case 'waiting': this.waitingCancel.emit(); break;
    }
  }

  copied = signal(false);
  copyLink() {
    const link = `https://laserchess.elcangrejo.es/add-friend/${this.userRepo.getUsername() || ''}`;
    navigator.clipboard.writeText(link);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }


  getItemName(type: 'board_skin' | 'piece_skin' | 'win_animation', id?: number | null): string {
    if (id === null || id === undefined) return 'N/A';

    switch (type) {
      case 'board_skin':
        switch (id) {
          case 4: return 'Classic';
          case 5: return 'Soretro';
          case 6: return 'Cats';
          default: return `Tablero ${id}`;
        }

      case 'piece_skin':
        switch (id) {
          case 1: return 'Classic';
          case 2: return 'Soretro';
          case 3: return 'Cats';
          default: return `Piezas ${id}`;
        }

      case 'win_animation':
        switch (id) {
          case 7: return 'Classic';
          case 8: return 'Soretro';
          case 9: return 'Cats';
          default: return `Animación ${id}`;
        }
    }
  }

  getItemIcon(type: 'board_skin' | 'piece_skin' | 'win_animation', id?: number | null): string {
    if (id === null || id === undefined) return '';

    switch (type) {
      case 'board_skin':
        switch (id) {
          case 4: return 'assets/vector-art/Backgrounds/Classic/BG-classic.svg';
          case 5: return 'assets/vector-art/Backgrounds/Soretro/BG-soretro.svg';
          case 6: return 'assets/vector-art/Backgrounds/Cats/BG-cats.svg';
          default: return '';
        }

      case 'piece_skin':
        switch (id) {
          case 1: return 'assets/vector-art/PieceSets/Classic/KIN-B-Classic.svg';
          case 2: return 'assets/vector-art/PieceSets/Soretro/KIN-B-Soretro.png';
          case 3: return 'assets/vector-art/PieceSets/Cats/KIN-B-Cats.svg';
          default: return '';
        }

      case 'win_animation':
        switch (id) {
          case 7: return 'assets/vector-art/DeathAnimations/Classic/Classic-Win.gif';
          case 8: return 'assets/vector-art/DeathAnimations/Soretro/Soretro-win.gif';
          case 9: return 'assets/vector-art/DeathAnimations/Cats/Cats-Win.gif';
          default: return '';
        }
    }
  }

  goToCustomize(): void {
    this.userInfoClose.emit();
    this.router.navigate(['/customize']);
  }

  private rankTable = [
    { min: 0,    max: 999,  name: 'Fotón I', icon: 'foton.svg' },
    { min: 1000, max: 1049, name: 'Fotón II', icon: 'foton.svg' },
    { min: 1050, max: 1099, name: 'Quark I', icon: 'quark.svg' },
    { min: 1100, max: 1149, name: 'Quark II', icon: 'quark.svg' },
    { min: 1150, max: 1199, name: 'Quark III', icon: 'quark.svg' },
    { min: 1200, max: 1249, name: 'Electron I', icon: 'electron.svg' },
    { min: 1250, max: 1299, name: 'Electron II', icon: 'electron.svg' },
    { min: 1300, max: 1349, name: 'Electron III', icon: 'electron.svg' },
    { min: 1350, max: 1399, name: 'Electron IV', icon: 'electron.svg' },
    { min: 1400, max: 1449, name: 'Protón I', icon: 'proton.svg' },
    { min: 1450, max: 1499, name: 'Protón II', icon: 'proton.svg' },
    { min: 1500, max: 1549, name: 'Protón III', icon: 'proton.svg' },
    { min: 1550, max: 1599, name: 'Protón IV', icon: 'proton.svg' },
    { min: 1600, max: 1649, name: 'Neutrón I', icon: 'neutron.svg' },
    { min: 1650, max: 1699, name: 'Neutrón II', icon: 'neutron.svg' },
    { min: 1700, max: 1749, name: 'Neutrón III', icon: 'neutron.svg' },
    { min: 1750, max: 1799, name: 'Neutrón IV', icon: 'neutron.svg' },
    { min: 1800, max: 1849, name: 'Átomo I', icon: 'atom.svg' },
    { min: 1850, max: 1899, name: 'Átomo II', icon: 'atom.svg' },
    { min: 1900, max: 1949, name: 'Átomo III', icon: 'atom.svg' },
    { min: 1950, max: 1999, name: 'Átomo IV', icon: 'atom.svg' },
    { min: 2000, max: Infinity, name: 'Átomo V', icon: 'atom.svg' },
  ];

  getRankIconFromElo(elo: number): string {
    const rank = this.rankTable.find(r => elo >= r.min && elo <= r.max) ?? this.rankTable[0];
    return `assets/vector-art/Ranks/${rank.icon}`;
  }

  getRankNameFromElo(elo: number): string {
    const rank = this.rankTable.find(r => elo >= r.min && elo <= r.max) ?? this.rankTable[0];
    return rank.name;
  }

}
