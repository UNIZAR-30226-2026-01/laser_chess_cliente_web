import { Component, inject, OnInit, WritableSignal, signal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomizeRepository, CustomizeItemDisplay } from '../../repository/customize-repository';
import { map } from 'rxjs/operators';
import { Board } from '../../shared/board/board'
import { GameUtils } from '../../utils/game-utils'
import { BoardState } from '../../utils/board-state'
import { TopRow } from '../../shared/top-row/top-row';
import { UserRespository } from '../../repository/user-respository';


interface CustomizeGroup {
  type: string;
  title: string;
  items: CustomizeItemDisplay[];
}

@Component({
  selector: 'app-customize',
  standalone: true,
  imports: [CommonModule, Board, TopRow],
  templateUrl: './customize.html',
  styleUrls: ['./customize.css']
})

export class Customize implements OnInit {
  private customizeRepo = inject(CustomizeRepository);
  gameUtils = inject(GameUtils);
  boardState = inject(BoardState);
  groups: WritableSignal<CustomizeGroup[]> = signal<CustomizeGroup[]>([]);

  columnas = 10;
  filas = 8;
  listaPiezas = this.boardState.listaPiezas;
  laserPath = this.boardState.laserPath;
  board = this.boardState.currentBoard;

  currentIndices: WritableSignal<Map<string, number>> = signal(new Map());


  ngOnInit(): void {
    this.loadItems();
  }

  

  private loadItems(): void {
    this.customizeRepo.getCustomizeItems().pipe(
      map(items => this.groupByType(items))
    ).subscribe(groups => {
      this.groups.set(groups);
      this.initializeIndices(groups);

      const boardGroup = groups.find(g => g.type === 'board_skin');
      const equippedBoard = boardGroup?.items.find(item => item.isEquipped);

      if (equippedBoard) {
        this.boardState.setBoardSkinFromItemId(equippedBoard.id);
      }
    });
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

        if (item.type === 'board_skin') {
          this.boardState.setBoardSkinFromItemId(item.id);
        }

        if (item.type === 'piece_skin') {
          this.boardState.setPieceSkinFromItemId(item.id);
        }

        if (item.type === 'avatar') {
          this.boardState.setAvatarFromItemId(item.id);
        }

        if(item.type === 'win_animation'){
          this.boardState.setWinAnimatioFromItemId(item.id);
        }

      },
      error: (err: any) => {
        // Revertir en caso de error
        this.groups.set(previousGroups);
        console.error('Error al equipar:', err);
      }
    });
  }


  //Funciones para los carruseles para mover a la izquierda y a la derecha
  private initializeIndices(groups: CustomizeGroup[]): void {
    const newMap = new Map<string, number>();
    for (const group of groups) {
      const equippedIndex = group.items.findIndex(item => item.isEquipped);
      newMap.set(group.type, equippedIndex !== -1 ? equippedIndex : 0);
    }
    this.currentIndices.set(newMap);
  }

  nextItem(groupType: string): void {
    const group = this.groups().find(g => g.type === groupType);
    if (!group || group.items.length <= 1) return;
    const currentIdx = this.currentIndices().get(groupType) ?? 0;
    const newIdx = (currentIdx + 1) % group.items.length;
    this.updateCurrentIndex(groupType, newIdx);
    const newItem = group.items[newIdx];
    if (newItem) this.equip(newItem);
  }


  prevItem(groupType: string): void {
    const group = this.groups().find(g => g.type === groupType);
    if (!group || group.items.length <= 1) return;
    const currentIdx = this.currentIndices().get(groupType) ?? 0;
    const newIdx = (currentIdx - 1 + group.items.length) % group.items.length
    this.updateCurrentIndex(groupType, newIdx);
    const newItem = group.items[newIdx];
    if (newItem) this.equip(newItem);
  }

  private updateCurrentIndex(groupType: string, newIndex: number): void {
    const updatedMap = new Map(this.currentIndices());
    updatedMap.set(groupType, newIndex);
    this.currentIndices.set(updatedMap);
  }


}