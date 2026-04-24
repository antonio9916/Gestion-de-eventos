import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthSessionService, UserRole } from './auth-session.service';

export const authGuard: CanActivateFn = () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const isAuthenticated = !!authSession.getCurrentUser();
  if (!isAuthenticated) {
    void router.navigate(['/login']);
    return false;
  }
  return true;
};

function resolveAllowedRoles(data: unknown): readonly UserRole[] {
  if (!data || typeof data !== 'object') {
    return [];
  }
  const roles = (data as Record<string, unknown>)['roles'];
  if (!Array.isArray(roles)) {
    return [];
  }
  return roles.filter((role): role is UserRole => typeof role === 'string') as UserRole[];
}

export const roleGuard: CanActivateFn = (route) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const role = authSession.getRole();
  const allowedRoles = resolveAllowedRoles(route.data);

  if (!role) {
    void router.navigate(['/login']);
    return false;
  }

  if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
    return true;
  }

  void router.navigate(['/401']);
  return false;
};

export const authChildGuard: CanActivateChildFn = (_route, state) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const isAuthenticated = !!authSession.getCurrentUser();
  if (!isAuthenticated) {
    void router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};
