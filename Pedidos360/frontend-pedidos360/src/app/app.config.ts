import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import {
  provideRouter
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

import {
  registerLocaleData
} from '@angular/common';

import localeEsCl from '@angular/common/locales/es-CL';

import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  MsalInterceptor
} from '@azure/msal-angular';

import {
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation
} from '@azure/msal-browser';

import { routes } from './app.routes';


// Registrar el idioma español de Chile
registerLocaleData(localeEsCl);


// Permiso de acceso a Pedidos360-API
export const API_SCOPE =
  'api://238874f0-b1f7-4f4f-b532-32b4e905b728/access_as_user';


// URL pública del API Gateway
export const API_URL =
  'https://yrlrp1ixkf.execute-api.us-east-1.amazonaws.com';


// Configuración principal de Angular
export const appConfig: ApplicationConfig = {

  providers: [

    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    // Habilitar solicitudes HTTP e interceptores
    provideHttpClient(
      withInterceptorsFromDi()
    ),

    // Configuración regional
    {
      provide: LOCALE_ID,
      useValue: 'es-CL'
    },

    // Instancia principal de Microsoft MSAL
    {
      provide: MSAL_INSTANCE,

      useFactory: () => new PublicClientApplication({

        auth: {

          // ID de Pedidos360-Frontend
          clientId: 'f8b9bb59-e041-4948-8ad0-5c2e131c0a08',

          // Directorio de Microsoft Entra ID
          authority:
            'https://login.microsoftonline.com/a2e6c631-6073-419e-8394-472edc612ecd',

          // Dirección de Angular
          redirectUri: 'http://localhost:4200/',

          postLogoutRedirectUri: 'http://localhost:4200/login'

        },

        cache: {

          cacheLocation: BrowserCacheLocation.SessionStorage

        }

      })

    },

    // Configuración de protección de rutas
    {
      provide: MSAL_GUARD_CONFIG,

      useValue: {

        interactionType: InteractionType.Redirect,

        authRequest: {

          // Solicitar acceso a Pedidos360-API
          scopes: [
            'openid',
            'profile',
            API_SCOPE
          ]

        },

        loginFailedRoute: '/login'

      }

    },

    // Configuración del interceptor
    {
      provide: MSAL_INTERCEPTOR_CONFIG,

      useValue: {

        interactionType: InteractionType.Redirect,

        // Adjuntar el Access Token a las solicitudes
        // enviadas al API Gateway de AWS
        protectedResourceMap: new Map([
          [
            `${API_URL}/api/*`,
            [API_SCOPE]
          ]
        ])

      }

    },

    // Servicios de Microsoft MSAL
    MsalService,

    MsalGuard,

    MsalBroadcastService,

    // Interceptor para solicitudes HTTP
    {
      provide: HTTP_INTERCEPTORS,

      useClass: MsalInterceptor,

      multi: true
    }

  ]

};