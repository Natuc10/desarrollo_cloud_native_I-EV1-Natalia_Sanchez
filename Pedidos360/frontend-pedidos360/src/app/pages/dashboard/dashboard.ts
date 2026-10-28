import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Navbar } from '../../components/navbar/navbar';

import {
  MsalService,
  MsalBroadcastService
} from '@azure/msal-angular';

import {
  InteractionStatus,
  InteractionRequiredAuthError
} from '@azure/msal-browser';

import { filter, take } from 'rxjs/operators';

import { API_SCOPE } from '../../app.config';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  // Información del usuario autenticado
  nombreUsuario: string = 'Usuario';

  rolUsuario: string = '';

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    // Esperar a que MSAL termine de procesar la autenticación
    this.msalBroadcastService.inProgress$
      .pipe(
        filter(status => status === InteractionStatus.None),
        take(1)
      )
      .subscribe(() => {

        // Obtener nombre y rol del usuario
        this.cargarUsuario();

        // Comprobar que MSAL puede obtener el Access Token
        void this.comprobarAccessToken();

        // Probar la comunicación autenticada con el BFF a través de API Gateway
        this.probarConexionBff();

      });

  }


  // Obtener información del usuario autenticado
  cargarUsuario(): void {

    const cuenta =
      this.msalService.instance.getActiveAccount()
      ?? this.msalService.instance.getAllAccounts()[0];

    if (!cuenta) {
      return;
    }

    // Establecer la cuenta activa
    this.msalService.instance.setActiveAccount(cuenta);

    // Obtener el nombre del usuario autenticado
    this.nombreUsuario = cuenta.name || cuenta.username;

    // Obtener los roles del ID Token
    const claims = cuenta.idTokenClaims as
      { roles?: string[] } | undefined;

    const roles = claims?.roles ?? [];

    console.log(
      'Roles encontrados en el ID Token:',
      roles
    );

    if (roles.includes('ROLE_ADMINISTRADOR')) {

      this.rolUsuario = 'ADMINISTRADOR';

    } else if (roles.includes('ROLE_OPERADOR')) {

      this.rolUsuario = 'OPERADOR';

    } else if (roles.includes('ROLE_CLIENTE')) {

      this.rolUsuario = 'CLIENTE';

    }

    console.log(
      'Rol utilizado por Angular:',
      this.rolUsuario || 'SIN ROL'
    );

  }


  // Comprobar que MSAL puede obtener un Access Token para Pedidos360-API
  async comprobarAccessToken(): Promise<void> {

    const cuenta =
      this.msalService.instance.getActiveAccount()
      ?? this.msalService.instance.getAllAccounts()[0];

    if (!cuenta) {

      console.error(
        'No hay una cuenta autenticada para solicitar el Access Token.'
      );

      return;

    }

    try {

      const resultado =
        await this.msalService.instance.acquireTokenSilent({

          account: cuenta,

          scopes: [API_SCOPE]

        });

      // No mostrar el token completo en la consola
      console.log('Access Token obtenido correctamente.');

      // Leer únicamente los datos necesarios para diagnosticar el token
      const partesToken = resultado.accessToken.split('.');

      if (partesToken.length === 3) {

        const contenidoBase64 = partesToken[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/');

        const contenidoToken = JSON.parse(
          atob(contenidoBase64)
        );

        console.log(
          'Emisor del Access Token (iss):',
          contenidoToken.iss
        );

        console.log(
          'Audiencia del Access Token (aud):',
          contenidoToken.aud
        );

        console.log(
          'Roles encontrados en el Access Token:',
          contenidoToken.roles ?? []
        );

      } else {

        console.warn(
          'El Access Token no tiene el formato JWT esperado.'
        );

      }

      console.log(
        'Scopes concedidos:',
        resultado.scopes
      );

      console.log(
        'Cuenta autenticada:',
        resultado.account.username
      );

    } catch (error) {

      console.error(
        'No se pudo obtener el Access Token o leer sus datos:',
        error
      );

      if (error instanceof InteractionRequiredAuthError) {

        console.log(
          'Microsoft requiere una interacción adicional para conceder el permiso de la API.'
        );

      }

    }

  }


  // Comprobar la comunicación autenticada:
  // Angular -> API Gateway -> BFF en EC2
  probarConexionBff(): void {

    this.http.get<{
      mensaje: string;
      usuario: string;
    }>('https://yrlrp1ixkf.execute-api.us-east-1.amazonaws.com/api/prueba')
      .subscribe({

        next: (respuesta) => {

          console.log('Conexión con el BFF exitosa.');

          console.log(
            'Mensaje del BFF:',
            respuesta.mensaje
          );

          console.log(
            'Usuario autenticado:',
            respuesta.usuario
          );

        },

        error: (error) => {

          console.error(
            'Error al conectar Angular con el BFF:',
            error
          );

        }

      });

  }

}