import { Component, Input, Output, EventEmitter } from '@angular/core';

export type ToastType = 'desconexion' | 'pausa';

@Component({
  selector: 'app-notification-game',
  imports: [],
  templateUrl: './notification-game.html',
  styleUrl: './notification-game.css',
})
export class NotificationGame {
  @Input() tipo: ToastType = 'pausa';
  @Input() mensaje: string = '';
  
  @Output() alCerrar = new EventEmitter<void>();
  @Output() alAceptar = new EventEmitter<void>();
  @Output() alRechazar = new EventEmitter<void>();

  get esPausa() { return this.tipo === 'pausa'; }
  get esDesconexion() { return this.tipo === 'desconexion'; }
}