import { Component, OnInit } from '@angular/core';

type Helix = 'red' | 'white' | null;

interface Cell {
  r: number;
  c: number;
  dark: boolean;
  coord: string;
  helix: Helix;
  corner: boolean;
}

const FILE = 'ABCDEFGH';

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit {

}
