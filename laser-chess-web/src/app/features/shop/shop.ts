import { Component, signal } from '@angular/core';
import { ShopSection } from '../../model/shop/ShopSection';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.html',
  styleUrl: './shop.css'
})
export class Shop {

  sections = signal([
  {
    title: '¿Quieres personalizar tus piezas?',
    items: [
      { id: 1, name: 'Dragón rojo', price: 35, icon: 'assets/shop/dragon.png' },
      { id: 2, name: 'Neón azul', price: 120, icon: 'assets/shop/neon.png' },
      { id: 3, name: 'Madera clásica', price: 240, icon: 'assets/shop/wood.png', owned: true },
      { id: 4, name: 'Fuego oscuro', price: 183, icon: 'assets/shop/fire.png' },
      { id: 5, name: 'Hielo cristal', price: 90, icon: 'assets/shop/ice.png' },
      { id: 6, name: 'Acero metálico', price: 150, icon: 'assets/shop/metal.png' },
      { id: 7, name: 'Galaxy purple', price: 210, icon: 'assets/shop/galaxy.png' },
      { id: 8, name: 'Tóxico verde', price: 75, icon: 'assets/shop/toxic.png' },
      { id: 9, name: 'Oro brillante', price: 300, icon: 'assets/shop/gold.png' },
      { id: 10, name: 'Lava magma', price: 190, icon: 'assets/shop/lava.png' },
      { id: 11, name: 'Cyber punk', price: 260, icon: 'assets/shop/cyber.png' },
      { id: 12, name: 'Shadow noir', price: 170, icon: 'assets/shop/shadow.png' },
    ]
  },

  {
    title: '¿Quieres personalizar tu tablero?',
    items: [
      { id: 13, name: 'Clásico', price: 35, icon: 'assets/shop/board1.png' },
      { id: 14, name: 'Hielo', price: 120, icon: 'assets/shop/board2.png' },
      { id: 15, name: 'Oscuro', price: 240, icon: 'assets/shop/board3.png' },
      { id: 16, name: 'Galaxy', price: 183, icon: 'assets/shop/board4.png' },
      { id: 17, name: 'Neón grid', price: 110, icon: 'assets/shop/board5.png' },
      { id: 18, name: 'Arena desert', price: 95, icon: 'assets/shop/board6.png' },
      { id: 19, name: 'Cyber grid', price: 210, icon: 'assets/shop/board7.png' },
      { id: 20, name: 'Wood dark', price: 140, icon: 'assets/shop/board8.png' },
      { id: 21, name: 'Space void', price: 275, icon: 'assets/shop/board9.png' },
      { id: 22, name: 'Fire lava', price: 200, icon: 'assets/shop/board10.png' },
      { id: 23, name: 'Ice frozen', price: 160, icon: 'assets/shop/board11.png' },
      { id: 24, name: 'Retro arcade', price: 180, icon: 'assets/shop/board12.png' },
    ]
  }
]);

  scrollLeft(container: HTMLElement) {
    this.scrollByItems(container, -5);
  }

  scrollRight(container: HTMLElement) {
    this.scrollByItems(container, 5);
  }

  private scrollByItems(container: HTMLElement, direction: number) {
    const items = Array.from(container.children) as HTMLElement[];

    if (items.length === 0) return;

    const itemWidth = items[0].offsetWidth;
    const gap = 15; // el gap del CSS

    const step = (itemWidth + gap) * 5; // 👈 5 items

    container.scrollBy({
      left: direction * step,
      behavior: 'smooth'
    });
  }
}