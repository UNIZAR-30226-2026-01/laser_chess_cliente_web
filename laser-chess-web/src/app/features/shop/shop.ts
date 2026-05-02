import { Component, inject, OnInit,  signal, computed  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopRepository, ShopItemDisplay } from '../../repository/shop-repository';
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

  items = signal<ShopItemDisplay[]>([]);
  userMoney = signal<number>(0);
  userLevel = signal<number>(0);

  //señal computada, su valor se va recalculando
  sections = computed<ShopSection[]>(() => {
    const items = this.items(); //valor actual
    const groups = new Map<string, ShopItemDisplay[]>(); //agrupar ítems por tipo
    items.forEach(item => { //todos los items al map
      if (!groups.has(item.itemType)) groups.set(item.itemType, []);
      groups.get(item.itemType)!.push(item); //meter el actual
    });
    return Array.from(groups.entries()).map(([type, itemList]) => ({
      title: this.getSectionTitle(type),
      items: itemList
    }));
  });

  ngOnInit(): void {
    // Cargar datos del usuario, un dia mas
    this.loadUserData();
  }
  

  private loadUserData(): void {
    // Cargar
    this.shopRepo.getShopItemsWithOwnership().subscribe(items => {
      this.items.set(items);
    });

    // Cargar datos del usuario
    this.remote.getOwnAccount().subscribe({
      next: (account: AccountResponse) => {
        this.userMoney.set(account.money);
        this.userLevel.set(account.level);
      },
      error: (err) => console.error('Error al cargar cuenta', err)
    });
  }

  getSectionTitle(type: string): string {
    switch (type) {
      case 'win_animation': return 'Wins';
      case 'board_skin': return 'Tableros';
      case 'piece_skin': return 'Piezas';
      case 'avatar': return 'Avatares';
      default: return 'Otros';
    }
  }

  canBuy(item: ShopItemDisplay): boolean {
    return !item.owned && this.userLevel() >= item.levelRequisite && this.userMoney() >= item.price;
  }

  buyItem(item: ShopItemDisplay): void {
    if (!this.canBuy(item)) return;

    // Guardar estado actual para posible reversión
    const previousItems = this.items();
    const previousMoney = this.userMoney();

    // Actualizacion optimista (arquitectura software)
    // Marcarlo como owned
    const updatedItems = previousItems.map(i =>
      i.id === item.id ? { ...i, owned: true } : i
    );
    this.items.set(updatedItems);

    // Restar el precio
    this.userMoney.set(previousMoney - item.price);

    // Llamada al backend
    this.shopRepo.purchaseItem(item.id).subscribe({
      next: () => {
        console.log(`Compra exitosa: ${item.name}`);
        // recargar
        this.loadUserData();
      },
      error: (err) => {
        console.error(` Error al comprar ${item.name}:`, err);
        // Revertir
        this.items.set(previousItems);
        this.userMoney.set(previousMoney);
      }
    });
  }


}