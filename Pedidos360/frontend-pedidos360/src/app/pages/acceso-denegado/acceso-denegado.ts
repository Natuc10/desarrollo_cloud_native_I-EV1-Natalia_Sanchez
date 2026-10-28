import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';

import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './acceso-denegado.html',
  styleUrl: './acceso-denegado.css'
})

export class AccesoDenegado {

  constructor(
    private msalService: MsalService
  ) {}

  // Cerrar sesión para permitir ingresar con otra cuenta
  cerrarSesion(): void {

    this.msalService.logoutRedirect({

      postLogoutRedirectUri: 'http://localhost:4200/login',

      account:
        this.msalService.instance.getActiveAccount()
        ?? undefined

    });

  }

}