import { Component, inject, signal} from '@angular/core';
import { TopRow } from '../../shared/top-row/top-row';
import { Remote } from '../../model/remote/remote';
import { UpdateAccountRequest } from '../../model/auth/UpdateAccountRequest'

@Component({
  selector: 'app-settings',
  imports: [TopRow],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private remoteService = inject(Remote);
  private popUpPasswd = signal(false);
  private popUpSuccess = signal(false);
  private showError = signal(false)

  changePasswd(){
    console.log("Change password");
    this.popUpPasswd.set(true);
    // Falta actualizar que update el password
    // updateData(username: string , mail: String, board_skin: number, piece_skin: number, win_animation: number)
  }

  

  logout(){
    console.log("Logout");
    this.remoteService.logout();
  }

  deleteAccount(){
    console.log("Delete account");
    this.remoteService.deleteAccount();
  }

}
