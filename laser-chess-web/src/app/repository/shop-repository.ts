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
        name = `Tablero ${dto.item_id}`;
        icon = '';
        break;
      case 'piece_skin':
        name = `Pieza ${dto.item_id}`;
        icon = '';
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