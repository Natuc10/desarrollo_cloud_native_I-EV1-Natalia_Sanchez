import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import {
  MsalService,
  MsalBroadcastService
} from '@azure/msal-angular';

import {
  InteractionStatus
} from '@azure/msal-browser';

import {
  filter,
  take
} from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login implements OnInit {

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {

    // Inicializar MSAL antes de consultar la sesión
    await this.msalService.instance.initialize();

    // Procesar la respuesta de Microsoft Entra ID
    const resultado =
      await this.msalService.instance.handleRedirectPromise();

    // Si Microsoft devuelve una cuenta autenticada
    if (resultado?.account) {

      this.msalService.instance.setActiveAccount(
        resultado.account
      );

      this.verificarSesion();

      return;

    }

    // Esperar a que MSAL termine cualquier interacción
    this.msalBroadcastService.inProgress$
      .pipe(
        filter(status => status === InteractionStatus.None),
        take(1)
      )
      .subscribe(() => {

        this.verificarSesion();

      });

  }


  // Comprobar si existe una sesión autenticada
  verificarSesion(): void {

    const cuenta =
      this.msalService.instance.getActiveAccount()
      ?? this.msalService.instance.getAllAccounts()[0];

    if (!cuenta) {

      console.log('No existe una sesión autenticada.');

      return;

    }

    // Establecer la cuenta activa
    this.msalService.instance.setActiveAccount(cuenta);

    // Obtener los roles del usuario
    const claims = cuenta.idTokenClaims as
      { roles?: string[] } | undefined;

    const roles = claims?.roles ?? [];

    console.log('Usuario autenticado:', cuenta.username);

    console.log('Roles del usuario:', roles);

    // Redirigir automáticamente al Dashboard
    this.router.navigateByUrl('/dashboard');

  }


  // Iniciar sesión con Microsoft
  iniciarSesionMicrosoft(): void {

    this.msalService.loginRedirect({

      scopes: ['openid', 'profile']

    });

  }

}