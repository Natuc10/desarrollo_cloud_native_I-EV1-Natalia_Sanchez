import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import { MsalService } from '@azure/msal-angular';

export const roleGuard: CanActivateFn = (route) => {

  const msalService = inject(MsalService);
  const router = inject(Router);

  // Obtener la cuenta que inició sesión
  const cuenta =
    msalService.instance.getActiveAccount()
    ?? msalService.instance.getAllAccounts()[0];

  // Si no hay sesión, volver al Login
  if (!cuenta) {
    return router.createUrlTree(['/login']);
  }

  // Obtener los roles asignados en Microsoft Entra ID
  const claims = cuenta.idTokenClaims as
    { roles?: string[] } | undefined;

  const rolesUsuario = claims?.roles ?? [];

  // Obtener los roles autorizados para la ruta solicitada
  const rolesPermitidos: string[] = route.data['roles'] ?? [];

  // Si la ruta no tiene roles configurados, denegar el acceso
  if (rolesPermitidos.length === 0) {
    return router.createUrlTree(['/acceso-denegado']);
  }

  // Comprobar si el usuario tiene al menos un rol permitido
  const tieneAcceso = rolesPermitidos.some(
    rol => rolesUsuario.includes(rol)
  );

  if (tieneAcceso) {
    return true;
  }

  // Usuario autenticado, pero sin permiso para esta ruta
  return router.createUrlTree(['/acceso-denegado']);

};