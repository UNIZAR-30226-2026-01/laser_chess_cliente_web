import { Component, inject, signal, OnInit } from '@angular/core';
import { Remote } from '../../model/remote/remote';
import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';
import { IconService } from '../../model/user/icon'
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';


// interfaz para guardar los datos del perfil
interface MyProfile {
  userId: number;
  username: string;
  level: number;
  avatar?: 'red' | 'blue' | 'green' | 'yellow';
  coins: number;
  rankedPoints: number;
  blitzElo?: number;
  rapidElo?: number;
  classicElo?: number;
  extendedElo?: number;
}



@Component({
  selector: 'app-top-row',
  imports: [MatIconModule, CommonModule],
  templateUrl: './top-row.html',
  styleUrl: './top-row.css',
})
export class TopRow implements OnInit {
  
  private remote = inject(Remote);

  // Señales para la barra 
  username = signal('Cargando...');
  pictureURL: string | null = null;  coins = signal(0);
  rankedPoints = signal(0);
  private iconService = inject(IconService);
  
  

  // Popup de perfil
  showProfilePopup = signal(false);
  userProfile: MyProfile | null = null;


  ngOnInit() {
    this.loadMyData();
  }

  loadMyData() {
    const accountId = this.remote.getAccountId();
    if (!accountId) {
      this.username.set('Invitado');
      return;
    }

    this.remote.getAccount(accountId).subscribe({
      next: (response) => {
        const account = response.body;
        if (account) {
          
          const acc = account as any;
          this.username.set(acc.username || 'Usuario');
          this.coins.set(acc.coins ?? 0);
          this.rankedPoints.set(acc.rankedPoints ?? 0);
          
          const avatarMap: Record<number, 'red' | 'green' | 'blue' | 'yellow'> = {
            1: 'red',
            2: 'green',
            3: 'blue',
            4: 'yellow'
          };

          const profile: MyProfile = {
            userId: accountId,
            username: acc.username || 'Usuario',
            level: acc.level ?? 1,
            avatar: avatarMap[acc.avatar] || 'red', // <-- aquí mapeamos
            coins: acc.coins ?? 0,
            rankedPoints: acc.rankedPoints ?? 0,
            blitzElo: undefined,
            rapidElo: undefined,
            classicElo: undefined,
            extendedElo: undefined,
          };
          this.userProfile = profile;

          // Cargar ELOs
          this.remote.getAllRatings(accountId).subscribe({
            next: (ratings: AllRatingsDTO) => {
              if (this.userProfile) {
                this.userProfile.blitzElo = ratings.blitz;
                this.userProfile.rapidElo = ratings.rapid;
                this.userProfile.classicElo = ratings.classic;
                this.userProfile.extendedElo = ratings.extended;
              }
            },
            error: (err) => console.warn('No se pudieron cargar los ELOs', err)
          });
        }
      },
      error: (err) => {
        console.error('Error cargando perfil', err);
        this.username.set('Error');
      }
    });
  }

  openProfile() {
    if (!this.userProfile) {
      this.loadMyData(); // Recargar por si acaso
    }
    this.showProfilePopup.set(true);
  }

  closeProfile() {
    this.showProfilePopup.set(false);
  }


}
