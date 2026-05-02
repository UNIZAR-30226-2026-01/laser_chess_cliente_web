import { Component, inject, OnInit, WritableSignal, signal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomizeRepository, CustomizeItemDisplay } from '../../repository/customize-repository';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Remote } from '../../model/remote/remote';
import { Board } from '../../shared/board/board'
import { GameUtils } from '../../utils/game-utils'
import { BoardState } from '../../utils/board-state'

interface CustomizeGroup {
  type: string;
  title: string;
  items: CustomizeItemDisplay[];
}

@Component({
  selector: 'app-customize',
  standalone: true,
  imports: [CommonModule, Board],
  templateUrl: './customize.html',
  styleUrls: ['./customize.css']
})

export class Customize implements OnInit {
  private customizeRepo = inject(CustomizeRepository);
  gameUtils = inject(GameUtils);
  boardState = inject(BoardState);
  private remote = inject(Remote);
  groups: WritableSignal<CustomizeGroup[]> = signal<CustomizeGroup[]>([]);

  columnas = 10;
  filas = 8;
  listaPiezas = this.boardState.listaPiezas;
  laserPath = this.boardState.laserPath;
  board = this.boardState.currentBoard;

  ngOnInit(): void {
    this.loadItems();
    this.refreshBoardPreview();
  }

  private refreshBoardPreview(): void {
  this.remote.getOwnAccount().subscribe(account => {
    this.boardState.setPieceSkinFromItemId(account.piece_skin);
    this.boardState.setBoardSkinFromItemId(account.board_skin);
  });
}

  private loadItems(): void {
    this.customizeRepo.getCustomizeItems().pipe(
      map(items => this.groupByType(items))
    ).subscribe(groups => this.groups.set(groups));
  }

  private groupByType(items: CustomizeItemDisplay[]): CustomizeGroup[] {
    const map = new Map<string, CustomizeItemDisplay[]>();
    items.forEach(item => {
      if (!map.has(item.type)) map.set(item.type, []);
      map.get(item.type)!.push(item);
    });
    return Array.from(map.entries()).map(([type, itemList]) => ({
      type,
      title: this.getTitle(type),
      items: itemList
    }));
  }

  private getTitle(type: string): string {
    switch (type) {
      case 'board_skin': return 'Tableros';
      case 'piece_skin': return 'Piezas';
      case 'win_animation': return 'Animaciones de victoria';
      case 'avatar': return 'Avatar';
      default: return 'Otros';
    }
  }

  equip(item: CustomizeItemDisplay): void {
    if (item.isEquipped) return;

    const previousGroups = this.groups();

    // Actualización optimista (arquitectura software)
    const updatedGroups = previousGroups.map((group: CustomizeGroup) => {
      if (group.type !== item.type) return group;
      const updatedItems = group.items.map((i: CustomizeItemDisplay) => ({
        ...i,   // Copia todas las propiedades del ítem original
        isEquipped: i.id === item.id //Se pone como que el item esta equipado
      }));
      return { ...group, items: updatedItems }; //Copia las propiedades del grupo y reemplaza 'items'
    });
    this.groups.set(updatedGroups);

    // Llamada al backend, la real para q haga cosas
    this.customizeRepo.equipItem(item.id, item.type.toUpperCase()).subscribe({
      next: () => {
        // Recargar 
        this.loadItems();
        this.refreshBoardPreview();
      },
      error: (err: any) => {
        // Revertir en caso de error
        this.groups.set(previousGroups);
        console.error('Error al equipar:', err);
      }
    });
  }

}