import { Injectable, signal, inject} from '@angular/core';
import { UserRespository } from '../../repository/user-respository';


@Injectable({
  providedIn: 'root',
})

export class GameState {
  private remote = inject(UserRespository);

  startingTime = signal<number>(0);
  increment = signal<number>(0);
  rivalName = signal<string>(this.remote.getUsername() ?? '');
  myName = signal<string>('');


}
