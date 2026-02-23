import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  imports: [],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  userLoginOn: boolean = false; // Variable para controlar el estado de inicio de sesión del usuario
}
