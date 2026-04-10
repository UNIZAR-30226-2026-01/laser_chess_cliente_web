import { Injectable, inject, signal} from '@angular/core';
import { Remote } from '../model/remote/remote';
import { AllRatingsDTO } from '../model/rating/AllRatingsDTO';
import { UpdateAccountRequest } from '../model/auth/UpdateAccountRequest';
import { MyProfile } from '../model/user/MyProfile';

@Injectable({
  providedIn: 'root',
})
export class UserRespository {
  private remoteService = inject(Remote);
  userProfile: MyProfile | null = null;



  getAccount() : MyProfile | null {
    console.log("Get account");
    const accountId = this.remoteService.getAccountId();
    if (!accountId) {
      if(this.userProfile){
        this.userProfile.username = 'Invitado';
      }
      return null;
    }

    this.remoteService.getAccount(accountId).subscribe({
          next: (response) => {
            const account = response.body;
            if (account) {
              
              const acc = account as any;
              if(this.userProfile){
                this.userProfile.username = acc.username;
                this.userProfile.money = acc.coins ?? 0;
                this.userProfile.rankedPoints = acc.rankedPoints ?? 0;
              }
              
              const avatarMap: Record<number, 'red' | 'green' | 'blue' | 'yellow'> = {
                1: 'red',
                2: 'green',
                3: 'blue',
                4: 'yellow'
              };
    
              const profile: MyProfile = {
                userId: accountId,
                username: acc.username || 'Usuario',
                mail: acc.mail || '',
                xp: acc.level ?? 1,
                avatar: avatarMap[acc.avatar] || 1, 
                money: acc.coins ?? 0,
                board_skin: acc.board_skin ?? 0,
                piece_skin: acc.piece_skin ?? 0,
                win_animation: acc.win_animation ?? 0,
                rankedPoints: acc.rankedPoints ?? 0,
                blitzElo: undefined,
                rapidElo: undefined,
                classicElo: undefined,
                extendedElo: undefined,
              };
              this.userProfile = profile;
    
              // Cargar ELOs
              this.remoteService.getAllRatings(accountId).subscribe({
                next: (ratings: AllRatingsDTO) => {
                  if (this.userProfile) {
                    this.userProfile.blitzElo = ratings.blitz;
                    this.userProfile.rapidElo = ratings.rapid;
                    this.userProfile.classicElo = ratings.classic;
                    this.userProfile.extendedElo = ratings.extended;
                  }
                },

                error: (err) => {
                  console.warn('No se pudieron cargar los ELOs', err)
                  return null
                }
              });

            }
          },
          error: (err) => {
            console.error('Error cargando perfil', err);
            return null;
          }
        });
    return this.userProfile;

  }

  updateData(username: string , mail: String, board_skin: number, piece_skin: number, win_animation: number){
    console.log("Update data");
    const request: UpdateAccountRequest = {
      // Revisar si tengo que mandar el contenido que ya tiene 
      username: username || this.userProfile?.username || '',
      mail: mail || this.userProfile?.mail || '',
      board_skin: board_skin || this.userProfile?.board_skin || 0,
      piece_skin: piece_skin || this.userProfile?.piece_skin || 0,
      win_animation: win_animation || this.userProfile?.win_animation || 0
    };
            
    // Llamada al servicio
    this.remoteService.updateAccount(request).subscribe({
      next: (httpResponse) => {
        if (httpResponse && httpResponse.body) {
          console.log('Perfil actualizado con éxito');
              
        } else {
          console.log('Update failed: No response body');
        }
      },
        error: (err) => {
          console.error('HTTP error during update', err);
          console.log('Update failed: No response body');
      }
    });

  
  } 

  deleteAccount(){
    console.log("Delete account");
    this.remoteService.deleteAccount().subscribe({
      next: (httpResponse) => { 
        if (httpResponse) {
          console.log('Cuenta eliminada con éxito');
          this.remoteService.logout();
        } else {
          console.warn('Delete failed: Unexpected response status');
        }
      },
      error: (err) => {
        console.error('HTTP error during delete', err);
        console.log('Delete failed: No response body');
      }
    });
  }
}
