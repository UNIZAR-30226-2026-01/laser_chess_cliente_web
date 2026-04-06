import { Component, inject, signal, OnInit } from '@angular/core';
import { Remote } from '../../model/remote/remote';
import { AllRatingsDTO } from '../../model/rating/AllRatingsDTO';

// interfaz para guardar los datos del perfil
interface MyProfile {
  userId: number;
  username: string;
  level: number;
  avatar?: string;
  coins: number;
  rankedPoints: number;
  blitzElo?: number;
  rapidElo?: number;
  classicElo?: number;
  extendedElo?: number;
}



@Component({
  selector: 'app-top-row',
  imports: [],
  templateUrl: './top-row.html',
  styleUrl: './top-row.css',
})
export class TopRow implements OnInit {
  
  private remote = inject(Remote);

  // Señales para la barra 
  username = signal('Cargando...');
  pictureURL = '/assets/picture.jpeg';
  coins = signal(0);
  rankedPoints = signal(0);
  
  /*
  username = 'User';
  pictureURL = '/assets/picture.jpeg';   
  timeModeLabel = 'Modo de tiempo';
  boardPreviewUrl = '/assets/picture.jpeg';
  coins = 1234;
  rankedPoints = 1234;
  */

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
          
          // el objeto con los datos del perfil
          const profile: MyProfile = {
            userId: accountId,
            username: acc.username || 'Usuario',
            level: acc.level ?? 1,
            avatar: acc.avatar,
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
