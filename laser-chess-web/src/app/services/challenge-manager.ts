import { Injectable , inject} from '@angular/core';
import { TimerService } from './timer-service';
import { ChallengeResume } from '../model/game/ChallengeResume';
import { UserRespository } from '../repository/user-respository';
import  { GameState } from '../utils/game-state'
import { Websocket } from '../model/remote/websocket';
import { FriendRespository } from '../repository/friend-respository';

@Injectable({
  providedIn: 'root',
})
export class ChallengeManager {

  timerService = inject(TimerService);
  gameState = inject(GameState);
  userRepo = inject(UserRespository);
  webSocket = inject(Websocket);
  friendService = inject(FriendRespository);

  accept(reto: ChallengeResume) {
    const endpoint = 'challenge/accept';
    const params = {
      username: reto.challenger_username,
    };
    console.log('Aceptando reto de:', reto.challenger_username);


    this.timerService.miTiempo.set(reto.starting_time);
    this.timerService.tiempoRival.set(reto.starting_time);

    this.gameState.miNombre.set(this.userRepo.getUsername() || '');
    this.gameState.miAvatar.set(this.userRepo.getAvatar() || 1);

    this.gameState.nombreRival.set(reto.challenger_username);
    const friend = this.friendService.getInfoFriend('pepe123')?.account_id;
    if(friend){
      const rivalProfile$ = this.userRepo.getAccount(friend);
      rivalProfile$.subscribe(profile => {
        this.gameState.avatarRival.set(profile.avatar || 1);
      });
    }else{
      this.gameState.avatarRival.set(1); //Aplicamos skin por defecto
    }
    
    

    console.log('Jugadores: ' + this.gameState.miNombre() + ' vs ' + this.gameState.nombreRival());
    this.webSocket.initConnection(endpoint, params);
    

  }

  reject(reto: ChallengeResume) {
    const endpoint = 'challenge/reject';
    const params = {
      username: reto.challenger_username,
    };
    console.log('Rechazando reto de:', reto.challenger_username);

    this.webSocket.initConnection(endpoint, params);

  }

   // Rentaria desacoplar esto
  sendChallenge(tablero: string, timeBase: number, increment: number, tipoPartida: string, iaLevel: number | null, id: number | null, username: string | null): void {

    // Map selected board to backend Board_T numeric values
    let board = 0;
    switch (tablero) {
      case 'Ace':
        board = 1;
        break;
      case 'Curiosity':
        board = 2;
        break;
      case 'Grail':
        board = 3;
        break;
      case 'Mercury':
        board = 4;
        break;
      case 'Sophie':
        board = 5;
        break;
    }
    const rawLevel = this.userRepo.getLevel() ?? 0;
    const level = Math.min(rawLevel, 3); // cap level to max 3
    

    var endpoint = '';
    var params;
    switch(tipoPartida){
      case 'ranked':
        endpoint = 'matchmaking'
        params = {
            time_base: timeBase,
            time_increment: increment,
            board,
            ranked: 0,
          };
        break;
      case 'ia':
        endpoint = 'bot'
        params = {
            starting_time: timeBase,
            time_increment: increment,
            board,
            level: iaLevel 
          };
        break;
      case 'public':
        endpoint = 'matchmaking'
        params = {
            board,
            time_base: timeBase,
            time_increment: increment,
            ranked: 1,
          };
        break;
      case 'private':
        endpoint = 'challenge';
        if (id) {
          params = {
            username: username,
            match_id: id
          };
        } else {
          params = {
            username: username,
            board,
            starting_time: timeBase,
            time_increment: increment,
          };
        }



    }
    this.timerService.miTiempo.set(timeBase * 1000);
    this.timerService.tiempoRival.set(timeBase * 1000);

    this.webSocket.initConnection(endpoint, params);


  }

  closeRequest(){
    this.webSocket.close();
  }

}
