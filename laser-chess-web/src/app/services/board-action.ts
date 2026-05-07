// board-actions.ts
import { Injectable, inject } from '@angular/core';
import { Signal, WritableSignal } from '@angular/core';
import { PiezaData } from '../model/game/PiezaData';

@Injectable({ providedIn: 'root' })
export class BoardAction {

  moverPieza(
    listaPiezas: WritableSignal<PiezaData[]>,
    desde: {x: number, y: number},
    hasta: {x: number, y: number}
  ) {
    listaPiezas.update(piezas =>
      piezas.map(p => {
        if (p.x === desde.x && p.y === desde.y) return { ...p, x: hasta.x, y: hasta.y };
        if (p.x === hasta.x && p.y === hasta.y) return { ...p, x: desde.x, y: desde.y };
        return p;
      })
    );
  }

  rotarPieza(
    listaPiezas: WritableSignal<PiezaData[]>,
    pos: {x: number, y: number},
    direccion: 'L' | 'R'
  ) {
    listaPiezas.update(piezas =>
      piezas.map(p => {
        if (p.x === pos.x && p.y === pos.y) {
          const angulo = direccion === 'R' ? 90 : -90;
          return { ...p, rotation: p.rotation + angulo };
        }
        return p;
      })
    );
  }

  eliminarPieza(
    listaPiezas: WritableSignal<PiezaData[]>,
    pos: {x: number, y: number},
    animada = false
  ) {
    if (animada) {
      listaPiezas.update(piezas =>
        piezas.map(p => (p.x === pos.x && p.y === pos.y) ? { ...p, isBeingCaptured: true } : p)
      );
      setTimeout(() => {
        listaPiezas.update(piezas => piezas.filter(p => !(p.x === pos.x && p.y === pos.y)));
      }, 400);
    } else {
      listaPiezas.update(piezas => piezas.filter(p => !(p.x === pos.x && p.y === pos.y)));
    }
  }
}