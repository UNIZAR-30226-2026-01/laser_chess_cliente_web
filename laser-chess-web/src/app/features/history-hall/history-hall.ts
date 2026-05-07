import { Component, inject , signal} from '@angular/core';
import { GameResume } from '../../model/game/GameResume';
import { GameRepository } from '../../repository/game-repository';
import { TopRow } from "../../shared/top-row/top-row";
import { HistoryService } from '../../services/history-service';
import { Router } from '@angular/router';
import { UserRespository } from '../../repository/user-respository';
import { BoardState } from '../../utils/board-state';
import { MyProfile } from '../../model/user/MyProfile';


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
  users = signal<Record<number, MyProfile>>({});
  boardState = inject(BoardState);
  opponentId = 0;

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
  const myId = this.userRepo.getId();

  this.partidas().forEach(game => {

    this.opponentId =
      game.p1_id === myId ? game.p2_id : game.p1_id;

    // si ya lo tienes, no vuelvas a pedirlo
    if (this.users()[this.opponentId]) return;

    this.userRepo.getAccount(this.opponentId).subscribe(profile => {
      this.users.update(u => ({
        ...u,
        [this.opponentId]: profile
      }));
    });
    this.userRepo.getOwnAccount().subscribe(profile => {
      this.users.update(u => ({
        ...u,
        [myId || 0]: profile
      }));
    });
    

  });
}

  visualidaPartida(partida: GameResume) {
    this.historyService.historySelectedGame.set(partida);
    
    this.userRepo.getAccount(this.opponentId).subscribe(profile => {
      this.historyService.rivalAvatar.set(profile.avatar || 1);
      this.boardState.skinRival.set(profile.piece_skin || 1);
    });

    this.userRepo.getOwnAccount().subscribe(profile => {
      this.historyService.miAvatar.set(profile.avatar || 1);
    });


    
   
    localStorage.setItem('historyGame', JSON.stringify(partida));
    
    this.router.navigate(['/history']);
  }
}
