

import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FriendSummary } from '../../model/social/FriendSummary';
import { FriendSummaryExtended } from '../../model/social/FriendSummaryExtended';

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

  // popup newFriend
  @Input() newFriendError = false;
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

  copyLink() {
    const link = `http://localhost:4200/profile/${this.userInfoUser?.account_id || ''}`;
    navigator.clipboard.writeText(link);
    }

}
