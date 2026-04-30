import { Component, inject , signal} from '@angular/core';
import { GameResume } from '../../model/game/GameResume';
import { GameRepository } from '../../repository/game-repository';
import { TopRow } from "../../shared/top-row/top-row";
import { HistoryService } from '../../services/history-service';
import { Router } from '@angular/router';
import { UserRespository } from '../../repository/user-respository';


@Component({
  selector: 'app-history-hall',
  imports: [TopRow],
  templateUrl: './history-hall.html',
  styleUrl: './history-hall.css',
})

export class HistoryHall {
  gameRepo = inject(GameRepository);
  historyService = inject(HistoryService);
  userRepo = inject(UserRespository)
  router = inject(Router)
  partidas = signal<GameResume[]> ([]);
  infoCargada = signal(false);
  usernames = signal<Record<number, string>>({});

  ngOnInit() {
    this.cargarPartidas();
    
  }

  // Método para cargar las partidas desde el repositorio
  cargarPartidas(){
    this.gameRepo.getFinishedGame().subscribe({
      next: (data: GameResume[]) => {
        console.log('Partidas cargadas:', data);
        this.partidas.set(data);
        this.infoCargada.set(true);
        this.cargarUsernames();
      },
      error: (error:any) => {
        console.error('Error al cargar partidas:', error);
      }
    });
  
  }

  cargarUsernames() {
    this.partidas().forEach(game => {

      if (!this.usernames()[game.p1_id]) {
        this.userRepo.getUsernameById(game.p1_id).subscribe(username => {
          this.usernames.update(u => ({
            ...u,
            [game.p1_id]: username
          }));
        });
      }

      if (!this.usernames()[game.p2_id]) {
        this.userRepo.getUsernameById(game.p2_id).subscribe(username => {
          this.usernames.update(u => ({
            ...u,
            [game.p2_id]: username
          }));
        });
      }

    });
  }

  visualidaPartida(partida: GameResume) {
    this.historyService.historySelectedGame.set(partida);
    localStorage.setItem('historyGame', JSON.stringify(partida));
    this.router.navigate(['/history']);
  }
}
