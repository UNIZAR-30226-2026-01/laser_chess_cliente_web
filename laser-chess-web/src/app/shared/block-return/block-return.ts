import { CanDeactivateFn } from '@angular/router';
import { Game } from '../../features/game/game'; // Ajusta la ruta a tu componente

export const BlockReturn: CanDeactivateFn<Game> = (component: Game) => {
  const permitSalida = localStorage.getItem('permitSalida') === 'true';
  if (permitSalida) {
    localStorage.setItem('permitSalida', 'false');
    return true;
  }

  // Esto cancela la navegación del Router inmediatamente
  component.mostrarAvisoSalida.set(true);
  
  return false; 
};