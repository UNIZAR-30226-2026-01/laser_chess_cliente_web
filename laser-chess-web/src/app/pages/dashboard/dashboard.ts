import { Component } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  userLoginOn: boolean = false; // Variable para controlar el estado de inicio de sesión del usuario
}
