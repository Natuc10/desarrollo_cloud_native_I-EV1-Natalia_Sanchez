import { Component, OnInit } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  MsalService,
  MsalBroadcastService
} from '@azure/msal-angular';

import {
  InteractionStatus,
  AccountInfo
} from '@azure/msal-browser';

import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  // Información del usuario autenticado
  nombreUsuario: string = 'Usuario';

  rolUsuario: string = 'Sin rol asignado';

  // Permiso para mostrar la opción Catálogo
  puedeVerCatalogo: boolean = false;

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  ngOnInit(): void {

    // Esperar a que Microsoft termine de procesar la autenticación
    this.msalBroadcastService.inProgress$
      .pipe(
        filter(status => status === InteractionStatus.None),
        take(1)
      )
      .subscribe(() => {
        this.cargarUsuario();
      });

  }

  // Obtener información del usuario autenticado
  cargarUsuario(): void {

    const cuenta: AccountInfo | null =
      this.msalService.instance.getActiveAccount()
      ?? this.msalService.instance.getAllAccounts()[0]
      ?? null;

    // Valores predeterminados: sin acceso al catálogo
    this.nombreUsuario = 'Usuario';
    this.rolUsuario = 'Sin rol asignado';
    this.puedeVerCatalogo = false;

    if (!cuenta) {
      return;
    }

    // Establecer la cuenta activa
    this.msalService.instance.setActiveAccount(cuenta);

    // Obtener el nombre del usuario
    this.nombreUsuario = cuenta.name || cuenta.username;

    // Obtener los roles de Microsoft Entra ID
    const claims = cuenta.idTokenClaims as
      { roles?: string[] } | undefined;

    const roles = claims?.roles ?? [];

    // Identificar el rol y configurar el menú
    if (roles.includes('ROLE_ADMINISTRADOR')) {

      this.rolUsuario = 'Administrador';
      this.puedeVerCatalogo = true;

    } else if (roles.includes('ROLE_OPERADOR')) {

      this.rolUsuario = 'Operador';
      this.puedeVerCatalogo = true;

    } else if (roles.includes('ROLE_CLIENTE')) {

      this.rolUsuario = 'Cliente';
      this.puedeVerCatalogo = false;

    }

  }

  // Cerrar sesión con Microsoft
  cerrarSesion(): void {

    this.msalService.logoutRedirect({

      postLogoutRedirectUri: 'http://localhost:4200/login',

      account:
        this.msalService.instance.getActiveAccount()
        ?? undefined

    });

  }

}