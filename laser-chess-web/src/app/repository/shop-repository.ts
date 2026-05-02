import { inject, Injectable } from '@angular/core';
import { Remote } from '../model/remote/remote';
import { ShopItemDTO } from '../model/shop/ShopItemDTO';
import { Observable, combineLatest, map, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface ShopItemDisplay {
  id: number;
  name: string;
  price: number;
  icon: string;
  owned: boolean;
  levelRequisite: number;
  itemType: string;
}

@Injectable({ providedIn: 'root' })
export class ShopRepository {
  private remote = inject(Remote);

  getShopItemsWithOwnership(): Observable<ShopItemDisplay[]> {
    return combineLatest([
      this.remote.listShopItems().pipe(
        catchError(err => {
          console.error('Error listShopItems', err);
          return of([]); //array vacio si falla
        })
      ),
      this.remote.getUserItems().pipe(
        catchError(err => {
          console.error('Error getUserItems', err);
          return of([]);
        })
      )
    ]).pipe(
      map(([shopItems, userItems]) => {
        console.log('SHOP ITEMS:', shopItems);
        console.log('USER ITEMS:', userItems);
        // Asegurar que son arrays
        const shopArray = Array.isArray(shopItems) ? shopItems : [];
        const userArray = Array.isArray(userItems) ? userItems : [];
        const ownedIds = new Set(userArray.map(item => item.item_id));
        return shopArray.map(shopItem => this.mapToDisplay(shopItem, ownedIds.has(shopItem.item_id)));
      })
    );
  }

  purchaseItem(itemId: number): Observable<void> {
    return this.remote.purchaseItem(itemId);
  }

  private mapToDisplay(dto: ShopItemDTO, owned: boolean): ShopItemDisplay {
    let name = '';
    let icon = '';
    const type = dto.item_type?.toLowerCase();
    
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

    
    return {
      id: dto.item_id,
      name,
      price: dto.price,
      icon,
      owned,
      levelRequisite: dto.level_requisite,
      itemType: type
    };
  }
}