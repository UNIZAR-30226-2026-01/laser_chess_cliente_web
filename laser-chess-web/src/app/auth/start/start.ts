import { Component,inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Remote } from '../../model/remote/remote';

@Component({
  selector: 'app-start',
  imports: [RouterLink],
  templateUrl: './start.html',
  styleUrl: './start.css',
})
export class Start {

  private remote = inject(Remote);
  private router = inject(Router);

  ngOnInit() {
    // access_token valido, vamos directo al home
    const token = this.remote.getAccessToken();
    if (token && !this.remote.isTokenExpired(token)) {
      this.router.navigate(['/home']);
    } else {
      // Si no, intentamos recuperar la sesión con el refresh_token
      this.remote.autoLogin().subscribe({
        next: (authenticated) => {
          if (authenticated) {
            this.router.navigate(['/home']);
          }
        },
        error: () => {
          // Si falla, pantalla de inicio
        }
      });
    }
  }


}
