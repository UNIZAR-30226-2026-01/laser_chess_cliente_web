import { Component, inject, OnInit,  signal, computed  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopRepository, ShopItemDisplay } from '../../repository/shop-repository';
import { Remote } from '../../model/remote/remote';
import { AccountResponse } from '../../model/auth/AccountResponse';
import { BoardState } from '../../utils/board-state';
import { TopRow } from '../../shared/top-row/top-row';
import { MatIconModule } from '@angular/material/icon';

interface ShopSection {
  type: string;
  title: string;
  items: ShopItemDisplay[];
  level: number;
}

@Component({
  selector: 'app-shop',
  imports: [CommonModule, TopRow, MatIconModule],
  templateUrl: './shop.html',
  styleUrls: ['./shop.css']
})
export class Shop implements OnInit {
  private shopRepo = inject(ShopRepository);
  private remote = inject(Remote);

  boardState = inject(BoardState);

  items = signal<ShopItemDisplay[]>([]);
  userMoney = signal<number>(0);
  userLevel = signal<number>(0);

  currentIndices = signal<Map<string, number>>(new Map());

  //señal computada, su valor se va recalculando
  sections = computed<ShopSection[]>(() => {
    const items = this.items();
    const groups = new Map<string, ShopItemDisplay[]>();

    items.forEach(item => {
      if (!groups.has(item.itemType)) groups.set(item.itemType, []);
      groups.get(item.itemType)!.push(item);
    });

    return Array.from(groups.entries()).map(([type, itemList]) => ({
      type,
      title: this.getSectionTitle(type),
      items: itemList,
      level: Math.min(...itemList.map(item => item.levelRequisite))
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
      case 'win_animation': return 'Animación';
      case 'board_skin': return 'Tablero';
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
        this.boardState.refreshUser();
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




  visibleItems(section: ShopSection): ShopItemDisplay[] {
    const start = this.currentIndices().get(section.type) ?? 0;
    const visibleCount = 4;

    return section.items.slice(start, start + visibleCount);
  }

  nextSection(section: ShopSection): void {
    const visibleCount = 4;
    const current = this.currentIndices().get(section.type) ?? 0;

    if (current + visibleCount >= section.items.length) {
      this.updateSectionIndex(section.type, 0);
    } else {
      this.updateSectionIndex(section.type, current + visibleCount);
    }
  }

  prevSection(section: ShopSection): void {
    const visibleCount = 4;
    const current = this.currentIndices().get(section.type) ?? 0;

    if (current === 0) {
      const lastPageStart = Math.max(0, section.items.length - visibleCount);
      this.updateSectionIndex(section.type, lastPageStart);
    } else {
      this.updateSectionIndex(section.type, Math.max(0, current - visibleCount));
    }
  }

  private updateSectionIndex(type: string, index: number): void {
    const updatedMap = new Map(this.currentIndices());
    updatedMap.set(type, index);
    this.currentIndices.set(updatedMap);
  }





}
