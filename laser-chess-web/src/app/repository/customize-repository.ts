import { inject, Injectable } from '@angular/core';
import { Remote } from '../model/remote/remote';
import { ShopItemDTO } from '../model/shop/ShopItemDTO';
import { AccountResponse } from '../model/auth/AccountResponse';
import { UpdateAccountRequest } from '../model/auth/UpdateAccountRequest';
import { Observable, combineLatest, map, switchMap } from 'rxjs';

export interface CustomizeItemDisplay {
  id: number;
  name: string;
  icon: string;
  type: string;  
  isEquipped: boolean;
}

@Injectable({ providedIn: 'root' })
export class CustomizeRepository {
    private remote = inject(Remote);

    // Obtiene todos los ítems del usuario y el estado actual de equipamiento
    getCustomizeItems(): Observable<CustomizeItemDisplay[]> {
        return combineLatest([
        this.remote.getUserItems(),
        this.remote.getOwnAccount()
        ]).pipe(
        map(([items, account]) => {
            const equipped = {
            board_skin: account.board_skin,
            piece_skin: account.piece_skin,
            win_animation: account.win_animation,
            avatar: account.avatar 
            };
            return items.map(item => this.mapToDisplay(item, equipped));
        })
        );
    }


    // Equipa un ítem de un tipo dado
    equipItem(itemId: number, itemType: string): Observable<AccountResponse> {
        return this.remote.getOwnAccount().pipe(
        switchMap(account => {
            const updateRequest: UpdateAccountRequest = {
            username: account.username,
            mail: account.mail,
            board_skin: account.board_skin,
            piece_skin: account.piece_skin,
            win_animation: account.win_animation,
            avatar: account.avatar 
            };
            // cambiar campo
            switch (itemType) {
            case 'BOARD_SKIN':
                updateRequest.board_skin = itemId;
                break;
            case 'PIECE_SKIN':
                updateRequest.piece_skin = itemId;
                break;
            case 'WIN_ANIMATION':
                updateRequest.win_animation = itemId;
                break;
            case 'AVATAR':                   
                updateRequest.avatar = itemId;
                break;
            default:
                throw new Error('Tipo de ítem desconocido');
            }
            console.log('Petición de update:', updateRequest);
            return this.remote.updateAccount(updateRequest).pipe(
            map(response => response.body as AccountResponse)
            );
        })
        );
    }

    private mapToDisplay(dto: ShopItemDTO, equipped: any): CustomizeItemDisplay {
    let name = '';
    let icon = '';
    const type = dto.item_type?.toLowerCase() || '';

    switch (type) {

      case 'win_animation':
        name = `Animacion de victoria ${dto.item_id}`;
        icon = '';
        break;

      case 'board_skin':
        switch (dto.item_id) {
          case 4:
            name = 'Classic';
            icon = 'assets/vector-art/Backgrounds/Classic/BG-classic.svg';
            break;
          case 5:
            name = 'Soretro';
            icon = 'assets/vector-art/Backgrounds/Soretro/BG-soretro.svg';
            break;
          case 6:
            name = 'Cats';
            icon = 'assets/vector-art/Backgrounds/Cats/BG-cats.svg';
            break;
        }
        break;

      case 'piece_skin':
        switch (dto.item_id) {
          case 1:
            name = 'Classic';
            icon = 'assets/vector-art/PieceSets/Classic/KIN-B-Classic.svg';
            break;
          case 2:
            name = 'Soretro';
            icon = 'assets/vector-art/PieceSets/Soretro/KIN-B-Soretro.png';
            break;
          case 3:
            name = 'Cats';
            icon = 'assets/vector-art/PieceSets/Cats/KIN-B-Cats.svg';
            break;
        }
        break;

      case 'avatar':                 
        const botNumber = dto.item_id - 9; // Formulita pues el id del primer avatar es 10, y el nombre de la imagen es bot1
        name = `Avatar ${botNumber}`;  
        icon = `assets/vector-art/ProfilePictures/bot${botNumber}.svg`;
        break;

      default:
        name = `?? ${dto.item_id}`; //otra cosa
        icon = '';

    }

    let isEquipped = false;
    if (type === 'board_skin') isEquipped = (equipped.board_skin === dto.item_id);
    else if (type === 'piece_skin') isEquipped = (equipped.piece_skin === dto.item_id);
    else if (type === 'win_animation') isEquipped = (equipped.win_animation === dto.item_id);
    else if (type === 'avatar') isEquipped = (equipped.avatar === dto.item_id);

    return {
      id: dto.item_id,
      name,
      icon,
      type: type.toLowerCase(),
      isEquipped
    };
  }

}