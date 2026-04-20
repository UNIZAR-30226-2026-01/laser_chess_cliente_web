import { CanDeactivateFn } from '@angular/router';
import { Game } from '../../features/game/game'; // Ajusta la ruta a tu componente

export const BlockReturn: CanDeactivateFn<Game> = (component: Game) => {
  // 1. Si la partida terminó, vía libre
  if (component.permitSalida()) {
    return true;
  }

  // 2. Si intenta salir, activamos TU modal y devolvemos FALSE
  // Esto cancela la navegación del Router inmediatamente
  component.mostrarAvisoSalida.set(true);
  
  return false; 
};