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
            win_animation: account.win_animation
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
            win_animation: account.win_animation
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
    const type = dto.item_type;

    switch (type) {
      case 'WIN_ANIMATION':
        name = `Animación ${dto.item_id}`;
        icon = '';
        break;
      case 'BOARD_SKIN':
        name = `Tablero ${dto.item_id}`;
        icon = '';
        break;
      case 'PIECE_SKIN':
        name = `Pieza ${dto.item_id}`;
        icon = '';
        break;
      default:
        name = `Item ${dto.item_id}`;
        icon = '';
    }

    let isEquipped = false;
    if (type === 'BOARD_SKIN') isEquipped = (equipped.board_skin === dto.item_id);
    else if (type === 'PIECE_SKIN') isEquipped = (equipped.piece_skin === dto.item_id);
    else if (type === 'WIN_ANIMATION') isEquipped = (equipped.win_animation === dto.item_id);

    return {
      id: dto.item_id,
      name,
      icon,
      type: type.toLowerCase(),
      isEquipped
    };
  }

}