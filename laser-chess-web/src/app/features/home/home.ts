import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TopRow } from '../../shared/top-row/top-row';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TopRow],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  username = 'User';
  pictureURL = '/assets/picture.jpeg';
  timeModeLabel = 'Modo de tiempo';
  boardPreviewUrl = '/assets/picture.jpeg';
  coins = 1234;
  rankedPoints = 1234;
}
