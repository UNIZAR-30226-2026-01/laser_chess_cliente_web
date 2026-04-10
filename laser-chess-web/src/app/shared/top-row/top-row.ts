import { Component, inject, signal, OnInit } from '@angular/core';
import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';
import { IconService } from '../../model/user/icon'
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { UserRespository } from '../../repository/user-respository';
import { MyProfile } from '../../model/user/MyProfile';


@Component({
  selector: 'app-top-row',
  imports: [MatIconModule, CommonModule],
  templateUrl: './top-row.html',
  styleUrl: './top-row.css',
})
export class TopRow implements OnInit {
  
  private remote = inject(UserRespository);

  // Señales para la barra 
  username = signal('Cargando...');
  pictureURL: string | null = null;  
  coins = signal(0);
  rankedPoints = signal(0);
  avatar?: 'red' | 'blue' | 'green' | 'yellow';
  private iconService = inject(IconService);
  userProfile: MyProfile | null = null;
  
  
  // Popup de perfil
  showProfilePopup = signal(false);


  ngOnInit() {
    this.loadMyData();
  }

  loadMyData() {
    console.log("Get account");

    this.userProfile = this.remote.getAccount();
    if(this.userProfile){
      this.username.set(this.userProfile.username);
      this.coins.set(this.userProfile.money);
      this.rankedPoints.set(this.userProfile.rankedPoints);
      this.avatar = this.userProfile.avatar;
    }
  }

  openProfile() {
    this.loadMyData(); // Recargar por si acaso
    this.showProfilePopup.set(true);
  }

  closeProfile() {
    this.showProfilePopup.set(false);
  }


}
