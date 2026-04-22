import { Component, Inject } from '@angular/core';
import { PausedGame } from '../../model/game/PausedGame';
import { GameRepository } from '../../repository/game-repository';


@Component({
  selector: 'app-history-hall',
  imports: [],
  templateUrl: './history-hall.html',
  styleUrl: './history-hall.css',
})
export class HistoryHall {
  gameRepo = Inject(GameRepository);
  partidas: PausedGame[] = [];

  ngOnInit() {
    this.cargarPartidas();
  }

  // Método para cargar las partidas desde el repositorio
  cargarPartidas(){
    this.gameRepo.getPausedGame().subscribe({
      next: (data: PausedGame[]) => {
        console.log('Partidas cargadas:', data);
        this.partidas = data;
      },
      error: (error:any) => {
        console.error('Error al cargar partidas:', error);
      }
  });
  
  }
}
