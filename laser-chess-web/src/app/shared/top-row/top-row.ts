import { Component, inject, signal, OnInit } from '@angular/core';
import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';
import { IconService } from '../../model/user/icon'
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { UserRespository } from '../../repository/user-respository';
import { MyProfile } from '../../model/user/MyProfile';
import { Observable } from 'rxjs';
import { XpInfo } from '../../repository/user-respository';
import { BoardState } from '../../utils/board-state';

@Component({
  selector: 'app-top-row',
  imports: [MatIconModule, CommonModule],
  templateUrl: './top-row.html',
  styleUrl: './top-row.css',
})
export class TopRow implements OnInit {

  private remote = inject(UserRespository);
  private boardState = inject(BoardState)

  // Señales para la barra
  username = signal('Cargando...');
  pictureURL: string | null = null;
  coins = signal(0);
  rankedPoints = signal(0);
  xpPercentage = signal(0);
  xpInfoDetail = signal({ current: 0, required: 100 });
  avatar = signal(0);
  userProfile$!: Observable<MyProfile>;

  // Popup de perfil
  showProfilePopup = signal(false);


  ngOnInit() {
    this.loadMyData();
    this.loadXpData();
  }

  loadMyData() {
    console.log("Get account");

      this.userProfile$ = this.remote.getOwnAccount();

      this.userProfile$.subscribe(profile => {
        const cAvatar = profile.avatar - 9;
        this.avatar.set(cAvatar);
    });

  }

  loadXpData() {
    this.remote.getXpInfo().subscribe({
      next: (data: XpInfo) => {
        if (data.required_xp > 0) {
          const percentage = (data.xp / data.required_xp) * 100;
          this.xpPercentage.set(percentage);
          this.xpInfoDetail.set({
            current: data.xp,
            required: data.required_xp
          });
        }
      },
      error: (err) => console.error('Error cargando XP', err)
    });
  }

  openProfile() {
    this.showProfilePopup.set(true);
  }

  closeProfile() {
    this.showProfilePopup.set(false);
  }
}
