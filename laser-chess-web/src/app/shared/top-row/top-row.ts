import { Component } from '@angular/core';

@Component({
  selector: 'app-top-row',
  imports: [],
  templateUrl: './top-row.html',
  styleUrl: './top-row.css',
})
export class TopRow {
  username = 'User';
  pictureURL = '/assets/picture.jpeg';   
  timeModeLabel = 'Modo de tiempo';
  boardPreviewUrl = '/assets/picture.jpeg';
  coins = 1234;
  rankedPoints = 1234;
}
