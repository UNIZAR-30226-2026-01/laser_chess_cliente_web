import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopRepository, ShopItemDisplay } from '../../repository/shop-repository';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Remote } from '../../model/remote/remote';
import { AccountResponse } from '../../model/auth/AccountResponse';

interface ShopSection {
  title: string;
  items: ShopItemDisplay[];
}

@Component({
  selector: 'app-shop',
  imports: [CommonModule],
  templateUrl: './shop.html',
  styleUrls: ['./shop.css']
})
export class Shop implements OnInit {
  private shopRepo = inject(ShopRepository);
  private remote = inject(Remote);

  sections$!: Observable<ShopSection[]>;
  userLevel = 0;
  userMoney = 0;


  ngOnInit(): void {
    // Cargar datos del usuario, un dia mas
    this.loadUserData();
    this.loadShopItems();
  }
  

  private loadUserData(): void {
    this.remote.getOwnAccount().subscribe({
      next: (account: AccountResponse) => {
        this.userLevel = account.level;
        this.userMoney = account.money;
      },
      error: (err) => console.error('Error cargando usuario', err)
    });
  }

  private loadShopItems(): void {
    this.sections$ = this.shopRepo.getShopItemsWithOwnership().pipe(
      map(items => this.groupByType(items))
    );
  }

  private groupByType(items: ShopItemDisplay[]): ShopSection[] {
    const groups = new Map<string, ShopItemDisplay[]>();
    items.forEach(item => {
      if (!groups.has(item.itemType)) groups.set(item.itemType, []);
      groups.get(item.itemType)!.push(item);
    });
    return Array.from(groups.entries()).map(([type, itemList]) => ({
      title: this.getSectionTitle(type),
      items: itemList
    }));
  }

  getSectionTitle(type: string): string {
    switch (type) {
      case 'win_animation': return 'Wins';
      case 'board_skin': return 'Tableros';
      case 'piece_skin': return 'Piezas';
      default: return 'Otros';
    }
  }

  canBuy(item: ShopItemDisplay): boolean {
    return !item.owned && this.userLevel >= item.levelRequisite && this.userMoney >= item.price;
  }

  buyItem(item: ShopItemDisplay): void {
    if (!this.canBuy(item)) {
      alert('No puedes comprar este ítem. Revisa nivel o dinero.');
      return;
    }
    this.shopRepo.purchaseItem(item.id).subscribe({
      next: () => {
        alert(`¡${item.name} comprado!`);
        this.loadUserData(); // Recargar dinero actualizado
        this.loadShopItems();
      },
      error: (err) => alert(err.message)
    });
  }

}