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
    const nombre: Record<number, string> = {
      1: 'grace',
      2: 'mimi',
      3: 'bob',
      4: 'malamar',
      5: 'sónar',
      6: 'bibble',
      7: 'euridice',
      8: 'davíh',
      9: 'mia',
      10: 'polix',
      11: 'mudkip',
      12: 'carolai'
    };
    
    switch (type) {

      case 'win_animation':
        name = `Animacion de victoria ${dto.item_id}`;
        switch (dto.item_id) {
          case 7:
            name = 'Classic';
            icon = 'assets/vector-art/DeathAnimations/Classic/Classic-Win.gif';
            break;
          case 8:
            name = 'Soretro';
            icon = 'assets/vector-art/DeathAnimations/Soretro/Soretro-win.gif';
            break;
          case 9:
            name = 'Cats';
            icon = 'assets/vector-art/DeathAnimations/Cats/Cats-Win.gif';
            break;
        }
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
        const botNumber = dto.item_id - 9;
        name = nombre[botNumber];  
        icon = `assets/vector-art/ProfilePictures/bot${botNumber}.svg`;
        break;

      default:
        name = `?? ${dto.item_id}`;
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