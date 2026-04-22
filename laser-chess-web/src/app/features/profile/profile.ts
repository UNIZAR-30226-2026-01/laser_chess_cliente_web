import { Component, OnInit, inject} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Remote } from '../../model/remote/remote';
import { UserRespository } from '../../repository/user-respository'; // o el tuyo
import { FriendRespository } from '../../repository/friend-respository';
import { FriendshipRequest } from '../../model/social/FriendshipRequest';
import { TopRow } from "../../shared/top-row/top-row";
import { MyProfile } from '../../model/user/MyProfile';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';



@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  imports: [TopRow, AsyncPipe],
})
export class Profile implements OnInit {

  private route = inject(ActivatedRoute);
  private userService = inject(UserRespository);
  private friendrService = inject(FriendRespository);

  userProfile$!: Observable<MyProfile>;
  isMyProfile = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        // 👤 Perfil de otro usuario
        this.isMyProfile = false;
        this.loadUser(parseInt(id));
      } else {
        // 🙋‍♀️ Mi perfil
        this.isMyProfile = true;
        const myId = this.userService.getId(); // o como lo tengas
        this.loadUser(myId);
      }
    });
  }

  loadUser(id: number | undefined) {
    if (!id) {
      console.error('No se pudo obtener el ID del usuario');
      return;
    }
    this.userProfile$ = this.userService.getAccount(id);
    console.log('Cargando perfil del usuario con ID:', id);
    
  }

  addFriend(username: string) {
    const request: FriendshipRequest = {
              receiver_username: username,
        };
    this.friendrService.addFriend(request).subscribe(() => {
      console.log('Solicitud enviada');
    });
  }
}