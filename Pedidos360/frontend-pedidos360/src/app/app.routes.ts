import { Routes } from '@angular/router';

import { MsalGuard } from '@azure/msal-angular';

import { roleGuard } from './guards/role.guard';

import { Login } from './pages/login/login';

import { Dashboard } from './pages/dashboard/dashboard';

import { Orders } from './pages/orders/orders';

import { Catalog } from './pages/catalog/catalog';

import { AccesoDenegado } from './pages/acceso-denegado/acceso-denegado';

export const routes: Routes = [

  // Redirigir automáticamente al Login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Pantalla de inicio de sesión (pública)
  {
    path: 'login',
    component: Login
  },

  // Pantalla para usuarios autenticados sin permisos
  {
    path: 'acceso-denegado',
    component: AccesoDenegado,
    canActivate: [MsalGuard]
  },

  // Dashboard: Cliente, Operador y Administrador
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [MsalGuard, roleGuard],
    data: {
      roles: [
        'ROLE_CLIENTE',
        'ROLE_OPERADOR',
        'ROLE_ADMINISTRADOR'
      ]
    }
  },

  // Pedidos: Cliente, Operador y Administrador
  {
    path: 'orders',
    component: Orders,
    canActivate: [MsalGuard, roleGuard],
    data: {
      roles: [
        'ROLE_CLIENTE',
        'ROLE_OPERADOR',
        'ROLE_ADMINISTRADOR'
      ]
    }
  },

  // Catálogo: solo Operador y Administrador
  {
    path: 'catalog',
    component: Catalog,
    canActivate: [MsalGuard, roleGuard],
    data: {
      roles: [
        'ROLE_OPERADOR',
        'ROLE_ADMINISTRADOR'
      ]
    }
  },

  // Redirigir al Login cuando la ruta no exista
  {
    path: '**',
    redirectTo: 'login'
  }

];